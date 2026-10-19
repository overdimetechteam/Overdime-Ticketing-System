const router = require('express').Router();
const { workhubWebhook } = require('../controllers/webhook.controller');

router.post('/workhub', workhubWebhook);

module.exports = router;
