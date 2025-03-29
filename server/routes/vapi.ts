import { Router, Request, Response } from 'express';
import axios from 'axios';

const vapiRouter = Router();

// Proxy endpoint to initialize Vapi conversations with our API key
vapiRouter.post('/init', async (req: Request, res: Response) => {
  const { assistantId } = req.body;
  
  if (!assistantId) {
    return res.status(400).json({ error: 'Missing assistantId' });
  }
  
  try {
    // Get Vapi API key from environment variables
    const vapiApiKey = process.env.VAPI_API_KEY;
    
    if (!vapiApiKey) {
      console.error('VAPI_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API key configuration error' });
    }
    
    // Make request to Vapi API to initialize the conversation
    const response = await axios.post('https://api.vapi.ai/init', {
      assistantId
    }, {
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Return Vapi's response to the client
    return res.json(response.data);
  } catch (error: any) {
    console.error('Error initializing Vapi conversation:', error);
    return res.status(500).json({ 
      error: 'Failed to initialize Vapi conversation',
      details: error.response?.data || error.message || String(error)
    });
  }
});

export default vapiRouter;