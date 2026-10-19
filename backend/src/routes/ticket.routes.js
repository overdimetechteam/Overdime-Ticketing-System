const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
  createTicket, getUserTickets, getTicket, closeTicket,
  getAllTickets, updateTicketStatus, getStats, syncFromWorkhub,
} = require('../controllers/ticket.controller');

// Static routes (must come before /:id)
router.post('/', authenticate, upload.array('attachments', 10), createTicket);
router.get('/my', authenticate, getUserTickets);
router.get('/stats', authenticate, requireAdmin, getStats);
router.get('/all', authenticate, requireAdmin, getAllTickets);
router.post('/sync-workhub', authenticate, requireAdmin, syncFromWorkhub);

// Dynamic /:id routes
router.get('/:id', authenticate, getTicket);
router.post('/:id/close', authenticate, closeTicket);
router.put('/:id/status', authenticate, requireAdmin, updateTicketStatus);

module.exports = router;
