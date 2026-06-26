// backend/routes/election.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getResults,
  createDemoElection,
  syncBlockchainVotes,
  recordVote,
  getVoters
} = require('../controllers/electionController');

// ✅ Make sure ALL functions exist and are exported
router.get('/results', protect, getResults);
router.get('/voters', protect, getVoters);
router.post('/create-demo', protect, createDemoElection);
router.post('/sync-votes', protect, syncBlockchainVotes);
router.post('/record-vote', protect, recordVote);

module.exports = router;