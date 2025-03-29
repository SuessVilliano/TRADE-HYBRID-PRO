import express, { Request, Response, Router } from 'express';
import axios from 'axios';

const router = Router();

// Endpoint to analyze images with Gemini Vision API
router.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    // Get the API key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Gemini API key not configured on the server' 
      });
    }
    
    // Get image and prompt from request
    const { image, prompt } = req.body;
    
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }
    
    // Extract base64 data from the data URL (remove the prefix like "data:image/jpeg;base64,")
    const base64Data = image.split(',')[1];
    
    if (!base64Data) {
      return res.status(400).json({ error: 'Invalid image data format' });
    }
    
    // Gemini API endpoint
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`;
    
    // Prepare the request payload
    const payload = {
      contents: [{
        parts: [
          {
            text: prompt || "Analyze this trading chart and identify key patterns or signals."
          },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }],
      safety_settings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ],
      generation_config: {
        temperature: 0.4,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      }
    };
    
    // Make the API request
    const response = await axios.post(endpoint, payload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    // Extract the generated text from the response
    const result = response.data;
    
    // Check if we got a valid response with content
    if (
      result.candidates && 
      result.candidates.length > 0 && 
      result.candidates[0].content && 
      result.candidates[0].content.parts && 
      result.candidates[0].content.parts.length > 0
    ) {
      const analysis = result.candidates[0].content.parts[0].text;
      res.json({ analysis });
    } else {
      // Handle cases where the response doesn't contain the expected data
      console.error('Unexpected Gemini API response structure:', JSON.stringify(result));
      res.status(500).json({ 
        error: 'Unexpected response format from Gemini API',
        details: result
      });
    }
  } catch (error: any) {
    console.error('Error calling Gemini Vision API:', error);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Gemini API error response:', error.response.data);
      res.status(error.response.status).json({ 
        error: 'Error from Gemini API', 
        details: error.response.data 
      });
    } else if (error.request) {
      // The request was made but no response was received
      res.status(500).json({ 
        error: 'No response from Gemini API. Network issue or timeout.' 
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      res.status(500).json({ 
        error: 'Error setting up request to Gemini API', 
        message: error.message 
      });
    }
  }
});

export default router;