import { Router } from 'express';
import { SIGNAL_SOURCES, sheetsService } from './sheets-service';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

const router = Router();

// Get signal sources (names only - for dropdown selection)
router.get('/sources', (req, res) => {
  res.json(SIGNAL_SOURCES.map(source => source.name));
});

// Process signals from a specific source
router.post('/process/:source', async (req, res) => {
  try {
    const source = req.params.source.toLowerCase();
    const signalSource = SIGNAL_SOURCES.find(s => s.name.toLowerCase() === source);
    
    if (!signalSource) {
      return res.status(404).json({ error: 'Signal source not found' });
    }
    
    if (!signalSource.sheetId) {
      return res.status(400).json({ error: 'Sheet ID not configured for this source' });
    }
    
    // Process the signals
    await sheetsService.processSignals(signalSource.sheetId);
    
    res.json({ success: true, message: `Signals from ${source} processed successfully` });
  } catch (error) {
    console.error(`Error processing signals from ${req.params.source}:`, error);
    res.status(500).json({ error: 'Failed to process signals' });
  }
});

// Helper function to set up Google Sheets API
const getGoogleSheetsClient = async () => {
  try {
    // Check for environment variables first
    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (apiKey) {
      // Create API key based client
      return google.sheets({ 
        version: 'v4', 
        auth: apiKey
      });
    }
    
    // If no API key, try service account credentials
    const credentialsPath = path.join(__dirname, '../uploads/google_api_credentials.json');
    
    if (fs.existsSync(credentialsPath)) {
      // Read and parse credentials
      const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      
      // Create JWT client
      const auth = new google.auth.JWT(
        credentials.client_email,
        undefined,
        credentials.private_key,
        ['https://www.googleapis.com/auth/spreadsheets']
      );
      
      // Create sheets client
      return google.sheets({ version: 'v4', auth });
    }
    
    throw new Error('No Google Sheets API credentials available');
  } catch (error) {
    console.error('Error setting up Google Sheets API:', error);
    throw error;
  }
};

// New endpoint to fetch signals from Google Sheets for the client
router.get('/trading-signals', async (req, res) => {
  try {
    const { sheetId, gid } = req.query;
    let spreadsheetId = sheetId as string;
    
    // If no sheet ID provided, try environment variables
    if (!spreadsheetId) {
      // Try different environment variables based on market type
      if (req.query.marketType === 'crypto') {
        spreadsheetId = process.env.PARADOX_SHEET_ID || process.env.CRYPTO_SIGNALS_SHEET_ID || '';
      } else if (req.query.marketType === 'futures') {
        spreadsheetId = process.env.HYBRID_SHEET_ID || process.env.FUTURES_SIGNALS_SHEET_ID || '';
      } else if (req.query.marketType === 'forex') {
        spreadsheetId = process.env.SOLARIS_SHEET_ID || process.env.FOREX_SIGNALS_SHEET_ID || '';
      }
    }
    
    // If still no sheet ID, use a default (this should be configured properly in production)
    if (!spreadsheetId) {
      spreadsheetId = '1sPOGJQOQJDuiS5W97tDmYEQotbYL-SYJkjl9YwqJAGg'; // Default sheet
    }
    
    // Determine which sheet/tab to use based on gid
    const sheetName = gid ? `gid=${gid}` : 'gid=0';
    
    try {
      // First try authenticated access using the Google Sheets API
      const sheets = await getGoogleSheetsClient();
      
      // Get the first sheet if no gid specified
      let range = 'A:Z';
      if (gid) {
        // If gid is specified, we need to find the sheet name first
        const sheetInfo = await sheets.spreadsheets.get({
          spreadsheetId,
          fields: 'sheets.properties'
        });
        
        const sheet = sheetInfo.data.sheets?.find(s => s.properties?.sheetId === Number(gid));
        if (sheet && sheet.properties?.title) {
          range = `${sheet.properties.title}!A:Z`;
        }
      }
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      });
      
      // Process the data and return it
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return res.json({ signals: [] });
      }
      
      // Extract headers from the first row
      const headers = rows[0];
      
      // Convert the rest of the rows to objects
      const signals = rows.slice(1).map((row, index) => {
        const signal: Record<string, any> = {
          id: `signal-${index}`
        };
        
        // Map each column to the corresponding header
        headers.forEach((header, colIndex) => {
          if (colIndex < row.length) {
            signal[header] = row[colIndex];
          }
        });
        
        return signal;
      });
      
      return res.json({ signals });
    } catch (authError) {
      console.error('Error accessing Google Sheets with authentication:', authError);
      
      // Fall back to public access method if authentication fails
      // Note: This only works for publicly shared sheets
      
      // Create the URL to fetch the data in JSON format
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&${sheetName}`;
      
      // Add cache-busting parameter
      const urlWithCacheBuster = `${url}&timestamp=${new Date().getTime()}`;
      
      console.log(`Falling back to public access method: ${urlWithCacheBuster}`);
      
      const response = await axios.get(urlWithCacheBuster, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.data) {
        return res.json({ signals: [] });
      }
      
      // Extract JSON data from Google's JSONP-like response
      let jsonData;
      try {
        // Handle different response formats
        if (response.data.indexOf('/*O_o*/') > -1) {
          const start = response.data.indexOf('(');
          const end = response.data.lastIndexOf(')');
          const jsonpData = response.data.substring(start + 1, end);
          jsonData = JSON.parse(jsonpData);
        } else if (response.data.startsWith('google.visualization.Query.setResponse(')) {
          const jsonpData = response.data.substring(41, response.data.length - 2);
          jsonData = JSON.parse(jsonpData);
        } else {
          // Try a more general approach
          const startIdx = response.data.indexOf('{');
          const endIdx = response.data.lastIndexOf('}') + 1;
          if (startIdx >= 0 && endIdx > startIdx) {
            const jsonText = response.data.substring(startIdx, endIdx);
            jsonData = JSON.parse(jsonText);
          } else {
            throw new Error('Could not find valid JSON in response');
          }
        }
      } catch (error) {
        console.error('Error parsing Google Sheets response:', error);
        return res.status(500).json({ error: 'Failed to parse sheet data' });
      }
      
      // Check for expected format
      if (!jsonData || !jsonData.table || !jsonData.table.cols || !jsonData.table.rows) {
        return res.json({ signals: [] });
      }
      
      // Extract column headers
      const headers = jsonData.table.cols.map((col: any) => col.label || col.id || '');
      
      // Process rows
      const signals = [];
      
      for (let i = 0; i < jsonData.table.rows.length; i++) {
        const row = jsonData.table.rows[i];
        if (!row.c) continue;
        
        // Create an array of cell values
        const values = row.c.map((cell: any) => {
          if (cell === null) return null;
          return cell.v !== undefined ? cell.v : null;
        });
        
        // Skip empty rows
        if (values.every((v: any) => v === null)) continue;
        
        // Create an object matching column headers to values
        const signal: Record<string, any> = {
          id: `signal-${i}-${Date.now()}`
        };
        
        headers.forEach((header: string, idx: number) => {
          if (header && idx < values.length) {
            signal[header] = values[idx];
          }
        });
        
        signals.push(signal);
      }
      
      return res.json({ signals });
    }
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    res.status(500).json({ error: 'Failed to fetch trading signals' });
  }
});

export default router;