import { Router } from 'express';
import axios from 'axios';

const router = Router();

// OpenAI API proxy endpoint
router.post('/', async (req, res) => {
  try {
    // Get OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.' 
      });
    }
    
    // Get the request body to forward to OpenAI
    const requestData = req.body;
    
    // Validate request data
    if (!requestData || !requestData.model || !requestData.messages) {
      return res.status(400).json({
        error: 'Invalid request. The request must include model and messages.'
      });
    }
    
    // Log request summary (without sensitive content)
    console.log(`OpenAI API request: model=${requestData.model}, messages_count=${requestData.messages.length}`);
    
    // Make request to OpenAI API
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Return the OpenAI response to the client
    res.json(openaiResponse.data);
  } catch (error: any) {
    console.error('Error proxying request to OpenAI:', error.message);
    
    // Return error to client
    if (error.response) {
      // OpenAI API error response
      return res.status(error.response.status).json({
        error: 'Error from OpenAI API',
        details: error.response.data
      });
    } else if (error.request) {
      // No response received
      return res.status(500).json({
        error: 'No response received from OpenAI API',
        details: error.message
      });
    } else {
      // Request setup error
      return res.status(500).json({
        error: 'Error setting up request to OpenAI API',
        details: error.message
      });
    }
  }
});

export default router;