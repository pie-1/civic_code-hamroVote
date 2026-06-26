// backend/controllers/electionController.js
const Election = require('../models/Election');
const Vote = require('../models/Vote');

// ✅ 1. getResults - MUST EXIST
const getResults = async (req, res) => {
  try {
    const election = await Election.findOne({ isActive: true });
    if (!election) {
      return res.status(404).json({ message: 'No active election' });
    }
    res.json({ success: true, data: election });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 2. createDemoElection - MUST EXIST
const createDemoElection = async (req, res) => {
  try {
    const existing = await Election.findOne({ isActive: true });
    if (existing) {
      return res.json({ success: true, data: existing, message: 'Election already exists' });
    }

    const election = await Election.create({
      title: "Presidential Election 2024",
      description: "Vote for your preferred candidate",
      candidates: [
        { id: 0, name: "Ram Prasad Sharma", party: "Nepali Congress", symbol: "🌲" },
        { id: 1, name: "Khadga Prasad Oli", party: "CPN-UML", symbol: "☀️" },
        { id: 2, name: "Sher Bahadur Deuba", party: "Nepali Congress", symbol: "🌳" },
        { id: 3, name: "Bishnu Paudel", party: "CPN-Maoist", symbol: "🔴" }
      ],
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true,
      totalVotes: 0
    });

    res.json({ success: true, message: 'Demo election created', data: election });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 3. syncBlockchainVotes - MUST EXIST (even if simple)
const syncBlockchainVotes = async (req, res) => {
  try {
    res.json({ success: true, message: 'Sync endpoint ready' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 4. recordVote - MUST EXIST
const recordVote = async (req, res) => {
  try {
    const { electionId, candidateId, txHash, walletAddress } = req.body;
    
    const vote = await Vote.create({
      voterId: req.user.id,
      electionId: electionId || 'demo',
      candidateId: candidateId,
      txHash: txHash || '',
      walletAddress: walletAddress || '',
      status: 'confirmed'
    });

    res.json({ success: true, message: 'Vote recorded', data: vote });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 5. getVoters - MUST EXIST
const getVoters = async (req, res) => {
  try {
    const votes = await Vote.find({ status: 'confirmed' })
      .populate('voterId', 'name email')
      .sort({ castAt: -1 });

    res.json({ success: true, data: votes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ EXPORT ALL FUNCTIONS
module.exports = {
  getResults,
  createDemoElection,
  syncBlockchainVotes,
  recordVote,
  getVoters
};