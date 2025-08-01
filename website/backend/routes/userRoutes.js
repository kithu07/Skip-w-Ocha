const express = require('express');
const router = express.Router();
const {
  getUserStats,
  getUserSettings,
  updateUserSettings,
  recordScream
} = require('../controllers/userController');

// GET /api/user-stats/:userId
router.get('/user-stats/:userId', getUserStats);

// GET /api/settings/:userId
router.get('/settings/:userId', getUserSettings);

// PUT /api/settings/:userId
router.put('/settings/:userId', updateUserSettings);

// POST /api/scream/:userId
router.post('/scream/:userId', recordScream);

module.exports = router; 