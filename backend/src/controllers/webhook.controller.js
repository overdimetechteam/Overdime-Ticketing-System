const { PrismaClient } = require('@prisma/client');
const workhubService = require('../services/workhub.service');
const emailService = require('../services/email.service');

const prisma = new PrismaClient();

// Workhub24 calls this endpoint when a card is updated
const workhubWebhook = async (req, res) => {
  try {
    const payload = req.body;
    console.log('Workhub24 webhook payload:', JSON.stringify(payload));

    const cardId = payload?.cardId || payload?.id || payload?.data?.id || payload?.data?.cardId;

    if (!cardId) {
      return res.status(400).json({ message: 'No card ID in payload' });
    }

    const ticket = await prisma.ticket.findFirst({
      where: { workhubCardId: String(cardId) },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!ticket) {
      return res.status(200).json({ message: 'Card not linked to any ticket' });
    }

    // Try stage/status from payload (Workhub24 may send stageId, stage, ticketStatus, or status)
    const rawStage = payload?.stageId || payload?.stage
      || payload?.ticketStatus || payload?.data?.stageId
      || payload?.data?.stage || payload?.data?.ticketStatus
      || payload?.status || payload?.data?.status;

    let mappedStatus = workhubService.mapWorkhubStatus(rawStage);

    // Fallback: fetch card directly to get current stageId
    if (!mappedStatus) {
      try {
        const card = await workhubService.getCard(String(cardId));
        const fetchedStage = card?.stageId || card?.stage || card?.data?.stageId;
        mappedStatus = workhubService.mapWorkhubStatus(fetchedStage);
      } catch (fetchErr) {
        console.error('Could not fetch card from Workhub24:', fetchErr.message);
      }
    }

    if (mappedStatus && mappedStatus !== ticket.status) {
      const oldStatus = ticket.status;
      const updated = await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: mappedStatus },
      });
      emailService.sendStatusUpdate(updated, ticket.user, oldStatus).catch(() => {});
      console.log(`Webhook: ${ticket.ticketId} → ${mappedStatus}`);
    }

    res.json({ message: 'OK' });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ message: 'Internal error' });
  }
};

module.exports = { workhubWebhook };
