import { Router, Request, Response } from 'express';
import axios from 'axios';

const vapiRouter = Router();

// Proxy endpoint to initialize Vapi conversations with our API key
vapiRouter.post('/init', async (req: Request, res: Response) => {
  const { assistantId } = req.body;
  
  if (!assistantId) {
    console.error('Missing assistantId in request body');
    return res.status(400).json({ error: 'Missing assistantId' });
  }
  
  try {
    // Get Vapi API key from environment variables
    const vapiApiKey = process.env.VAPI_API_KEY;
    
    if (!vapiApiKey) {
      console.error('VAPI_API_KEY environment variable is not set');
      return res.status(500).json({ error: 'API key configuration error' });
    }
    
    console.log(`Initializing Vapi conversation for assistant ID: ${assistantId}`);
    
    // Make request to Vapi API to initialize the conversation with the updated endpoint
    const response = await axios.post('https://api.vapi.ai/conversation', {
      assistant_id: assistantId,
      conversation_id: undefined // Allow Vapi to generate a new conversation ID
    }, {
      headers: {
        'Authorization': `Bearer ${vapiApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Vapi conversation initialized successfully:', response.data);
    
    // Return Vapi's response to the client
    return res.json({
      conversationId: response.data.conversation_id,
      assistantId: response.data.assistant_id
    });
  } catch (error: any) {
    console.error('Error initializing Vapi conversation:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Vapi API response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('Vapi API request error (no response received):', error.request);
    }
    
    return res.status(500).json({ 
      error: 'Failed to initialize Vapi conversation',
      details: error.response?.data || error.message || String(error)
    });
  }
});

export default vapiRouter;