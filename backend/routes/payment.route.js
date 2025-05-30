const express = require('express');
const router = express.Router();
const { approveBadges,createBonusSession, getSessionDetails } = require('../controllers/payment.controller');

router.post('/create-bonus-session', createBonusSession);

// Route: GET /api/payment/session/:sessionId
router.get('/session/:sessionId', getSessionDetails);

// POST /api/payment/approve-badges
router.post('/approve-badges',approveBadges);


module.exports = router;
