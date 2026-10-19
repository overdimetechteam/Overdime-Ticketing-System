require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const config = require('./config');
const workhubService = require('./services/workhub.service');
const emailService = require('./services/email.service');

const prisma = new PrismaClient();
const app = express();

app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.resolve(config.upload.dir)));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tickets', require('./routes/ticket.routes'));
app.use('/api/webhooks', require('./routes/webhook.routes'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: `File too large. Max ${config.upload.maxSizeMb}MB` });
  }
  res.status(500).json({ message: err.message || 'Internal server error' });
});

// Workhub24 sync: poll every 5 minutes.
// Reads stageId via getCard (not listCards) — stageId reflects the actual
// board position set by Workhub24 agents; ticketStatus is a custom text
// field only updated when our platform pushes changes.
cron.schedule('*/5 * * * *', async () => {
  try {
    if (!config.workhub.tenantId || !config.workhub.username) return;

    const tickets = await prisma.ticket.findMany({
      where: {
        workhubCardId: { not: null },
        NOT: { workhubCardId: '' },
        status: { not: 'CLOSED' },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    for (const ticket of tickets) {
      try {
        const card = await workhubService.getCard(ticket.workhubCardId);
        const rawValue = card.stageId || card.stage || card.ticketStatus;
        const mappedStatus = workhubService.mapWorkhubStatus(rawValue);

        if (mappedStatus && mappedStatus !== ticket.status) {
          const oldStatus = ticket.status;
          const updated = await prisma.ticket.update({
            where: { id: ticket.id },
            data: { status: mappedStatus },
          });
          emailService.sendStatusUpdate(updated, ticket.user, oldStatus).catch(() => {});
          console.log(`[Cron] ${ticket.ticketId}: ${oldStatus} → ${mappedStatus}`);
        }
      } catch (cardErr) {
        console.error(`[Cron] getCard failed for ${ticket.ticketId}:`, cardErr.message);
      }
    }
  } catch (err) {
    console.error('Workhub24 cron sync error:', err.message);
  }
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
