const { PrismaClient } = require('@prisma/client');
const path = require('path');
const workhubService = require('../services/workhub.service');
const emailService = require('../services/email.service');

const prisma = new PrismaClient();

async function generateTicketId() {
  const count = await prisma.ticket.count();
  const padded = String(count + 1).padStart(5, '0');
  return `TKT-${padded}`;
}

// User: create ticket
const createTicket = async (req, res) => {
  const { title, description, priority, affectedSystem, severity, contactNumber, application } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  const ticketId = await generateTicketId();

  const ticket = await prisma.ticket.create({
    data: {
      ticketId,
      title,
      description,
      priority: priority || 'MEDIUM',
      affectedSystem: affectedSystem || null,
      severity: severity || null,
      application: application || null,
      company: req.user.company || null,
      contactNumber: contactNumber || null,
      userId: req.user.id,
      attachments: req.files?.length
        ? {
            create: req.files.map((f) => ({
              filename: f.originalname,
              storedAs: f.filename,
              mimetype: f.mimetype,
              size: f.size,
            })),
          }
        : undefined,
    },
    include: { attachments: true, user: { select: { id: true, name: true, email: true } } },
  });

  // Push to Workhub24 (non-blocking)
  workhubService.createCard(ticket, req.user).then(async (cardData) => {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        workhubCardId: String(cardData?.id ?? cardData?.cardId ?? cardData?.data?.id ?? ''),
        workhubCardData: cardData,
      },
    });
  }).catch((err) => {
    console.error('Workhub24 card creation failed:', err.message,
      err.response?.status, JSON.stringify(err.response?.data));
  });

  emailService.sendTicketCreated(ticket, req.user).catch(() => {});

  res.status(201).json(ticket);
};

// User: get own tickets
const getUserTickets = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const where = { userId: req.user.id };
  if (status) where.status = status;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: { attachments: true, _count: { select: { comments: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.ticket.count({ where }),
  ]);

  res.json({ tickets, total, page: parseInt(page), limit: parseInt(limit) });
};

// User: get single ticket (own only unless admin)
const getTicket = async (req, res) => {
  const { id } = req.params;
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      attachments: true,
      comments: { orderBy: { createdAt: 'asc' } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (req.user.role !== 'ADMIN' && ticket.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json(ticket);
};

// User: close their own resolved ticket
const closeTicket = async (req, res) => {
  const { id } = req.params;
  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (ticket.userId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }
  if (ticket.status !== 'RESOLVED') {
    return res.status(400).json({ message: 'Only RESOLVED tickets can be closed by the user' });
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: { status: 'CLOSED' },
    include: { attachments: true },
  });

  if (ticket.workhubCardId) {
    const stageId = workhubService.mapToWorkhubStage('CLOSED');
    workhubService.updateCard(ticket.workhubCardId, { stageId }).catch(() => {});
  }

  res.json(updated);
};

// Admin: get all tickets
const getAllTickets = async (req, res) => {
  const { status, userId, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: {
        attachments: true,
        user: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.ticket.count({ where }),
  ]);

  res.json({ tickets, total, page: parseInt(page), limit: parseInt(limit) });
};

// Admin: update ticket status
const updateTicketStatus = async (req, res) => {
  const { id } = req.params;
  const { status, comment } = req.body;

  const VALID = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  if (!VALID.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

  const oldStatus = ticket.status;

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      status,
      ...(comment && {
        comments: {
          create: { body: comment, authorId: req.user.id, source: 'admin' },
        },
      }),
    },
    include: { attachments: true, user: { select: { id: true, name: true, email: true } } },
  });

  if (ticket.workhubCardId) {
    const stageId = workhubService.mapToWorkhubStage(status);
    if (stageId) {
      const STATUS_LABEL = { OPEN: 'Open', IN_PROGRESS: 'In Progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };
      const pad = (n) => String(n).padStart(2, '0');
      const now = new Date();
      const resolvedDate = status === 'RESOLVED'
        ? `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
        : '';
      workhubService.updateCard(ticket.workhubCardId, {
        stageId,
        ticketStatus: STATUS_LABEL[status] || status,
      }).catch((err) => {
        console.error('Workhub24 updateCard failed:', err.response?.status, JSON.stringify(err.response?.data), err.message);
      });
    }
  } else {
    console.warn(`Ticket ${ticket.ticketId} has no workhubCardId — skipping Workhub24 status sync`);
  }

  emailService.sendStatusUpdate(updated, ticket.user, oldStatus).catch(() => {});

  res.json(updated);
};

// Admin: get ticket stats
const getStats = async (req, res) => {
  const [total, open, inProgress, resolved, closed] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: 'OPEN' } }),
    prisma.ticket.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.ticket.count({ where: { status: 'RESOLVED' } }),
    prisma.ticket.count({ where: { status: 'CLOSED' } }),
  ]);

  res.json({ total, open, inProgress, resolved, closed });
};

// Admin: pull status updates from Workhub24
// Uses getCard per ticket so we read stageId (the real board position),
// not ticketStatus (a custom text field we write — agents don't update it).
const syncFromWorkhub = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        workhubCardId: { not: null },
        NOT: { workhubCardId: '' },
        status: { not: 'CLOSED' },
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    let synced = 0;
    const results = [];

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
          synced++;
          results.push({ ticketId: ticket.ticketId, from: oldStatus, to: mappedStatus });
          console.log(`[Sync] ${ticket.ticketId}: ${oldStatus} → ${mappedStatus} (stageId: ${card.stageId})`);
        }
      } catch (cardErr) {
        console.error(`[Sync] getCard failed for ${ticket.ticketId} (${ticket.workhubCardId}):`, cardErr.message);
      }
    }

    res.json({
      message: `Sync complete. ${synced} ticket(s) updated.`,
      synced,
      total: tickets.length,
      results,
    });
  } catch (err) {
    console.error('Workhub24 sync error:', err.message);
    res.status(500).json({ message: err.message || 'Sync failed' });
  }
};

module.exports = {
  createTicket, getUserTickets, getTicket, closeTicket,
  getAllTickets, updateTicketStatus, getStats, syncFromWorkhub,
};
