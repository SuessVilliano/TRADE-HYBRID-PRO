/**
 * API Routes for Solscan API Keys
 * 
 * This file provides endpoints to check and set the Solscan API key.
 */

import express, { Request, Response } from 'express';
import { SolscanAdapter } from '../mcp/adapters/solscan-adapter';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Initialize the Solscan adapter
const solscanAdapter = new SolscanAdapter(process.env.SOLSCAN_API_KEY || '');

/**
 * Check if the current Solscan API key is valid
 * GET /api/solscan/check
 */
router.get('/check', async (req: Request, res: Response) => {
  try {
    const isValid = await solscanAdapter.isApiKeyValid();
    
    res.json({
      hasKey: !!process.env.SOLSCAN_API_KEY,
      isValid
    });
  } catch (error) {
    console.error('Error checking Solscan API key:', error);
    res.status(500).json({ error: 'Failed to check Solscan API key' });
  }
});

/**
 * Set a new Solscan API key
 * POST /api/solscan/key
 */
router.post('/key', async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    // Create a temporary adapter with the new key to check its validity
    const tempAdapter = new SolscanAdapter(apiKey);
    const isValid = await tempAdapter.isApiKeyValid();
    
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid API key' });
    }
    
    // Update the environment variable
    process.env.SOLSCAN_API_KEY = apiKey;
    
    // Update the .env file
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      let envContent = '';
      
      // Read the current .env file
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }
      
      // Check if SOLSCAN_API_KEY exists in the .env file
      if (envContent.includes('SOLSCAN_API_KEY=')) {
        // Replace the existing key
        envContent = envContent.replace(
          /SOLSCAN_API_KEY=.*/,
          `SOLSCAN_API_KEY=${apiKey}`
        );
      } else {
        // Add the key to the .env file
        envContent += `\nSOLSCAN_API_KEY=${apiKey}`;
      }
      
      // Write the updated .env file
      fs.writeFileSync(envPath, envContent);
      
      // Reload environment variables
      dotenv.config();
      
      console.log('Solscan API key updated successfully');
      
      // Update the global solscanAdapter
      solscanAdapter.setApiKey(apiKey);
      
      return res.json({ 
        success: true, 
        message: 'Solscan API key updated successfully' 
      });
    } catch (fileError) {
      console.error('Error updating .env file:', fileError);
      return res.status(500).json({ error: 'Failed to update .env file' });
    }
  } catch (error) {
    console.error('Error setting Solscan API key:', error);
    res.status(500).json({ error: 'Failed to set Solscan API key' });
  }
});

export default router;