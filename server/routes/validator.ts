import express from 'express';

const router = express.Router();

// Endpoint to get Solana validator credentials
router.get('/credentials', (req, res) => {
  try {
    // Return the validator credentials from environment variables
    res.json({
      validatorIdentity: process.env.SOLANA_VALIDATOR_IDENTITY || '',
      voteAccount: process.env.SOLANA_VOTE_ACCOUNT || '',
    });
  } catch (error) {
    console.error('Error getting validator credentials:', error);
    res.status(500).json({ error: 'Failed to retrieve validator credentials' });
  }
});

export default router;