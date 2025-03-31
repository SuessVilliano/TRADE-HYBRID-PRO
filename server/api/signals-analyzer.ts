import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { google } from 'googleapis';
import { createClient as createGoogleSheetsClient } from 'google-auth-library';

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads/historical-data');
      
      // Create directory if it doesn't exist
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Save with asset name prefix for easy identification
      const asset = req.body.asset ? req.body.asset.toLowerCase() : 'unknown';
      const timestamp = Date.now();
      cb(null, `${asset}_${timestamp}_${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

const router = Router();

// Helper function to set up Google Sheets API
const getGoogleSheetsAuth = async () => {
  try {
    // Check if credentials file exists
    const credentialsPath = path.join(__dirname, '../uploads/google_api_credentials.json');
    
    if (!fs.existsSync(credentialsPath)) {
      throw new Error('Google API credentials file not found');
    }
    
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
    const sheets = google.sheets({ version: 'v4', auth });
    
    return { auth, sheets };
  } catch (error) {
    console.error('Error setting up Google Sheets API:', error);
    throw error;
  }
};

// Route to upload Google API credentials
router.post('/upload-credentials', upload.single('credentials'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Move file to correct location
    const targetPath = path.join(__dirname, '../uploads/google_api_credentials.json');
    
    // Create directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    fs.copyFileSync(req.file.path, targetPath);
    
    // Delete the temp file
    fs.unlinkSync(req.file.path);
    
    res.json({ success: true, message: 'Google API credentials uploaded successfully' });
  } catch (error) {
    console.error('Error processing credentials upload:', error);
    res.status(500).json({ success: false, message: 'Failed to upload credentials' });
  }
});

// Route to upload historical price data
router.post('/upload-historical', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // Get asset name from request
    const asset = req.body.asset;
    
    if (!asset) {
      return res.status(400).json({ success: false, message: 'Asset name is required' });
    }
    
    // Return success response
    res.json({
      success: true,
      message: 'Historical data uploaded successfully',
      filename: req.file.filename,
      asset
    });
  } catch (error) {
    console.error('Error uploading historical data:', error);
    res.status(500).json({ success: false, message: 'Failed to upload historical data' });
  }
});

// Route to get available historical data assets
router.get('/available-historical-data', (req, res) => {
  try {
    const uploadDir = path.join(__dirname, '../uploads/historical-data');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      return res.json({ assets: [] });
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(uploadDir);
    
    // Extract asset names from filenames
    const assets = new Set<string>();
    
    files.forEach(file => {
      // Files are named as asset_timestamp_originalname.csv
      const parts = file.split('_');
      if (parts.length >= 2) {
        assets.add(parts[0]);
      }
    });
    
    res.json({ assets: Array.from(assets) });
  } catch (error) {
    console.error('Error retrieving available historical data:', error);
    res.status(500).json({ error: 'Failed to retrieve available data' });
  }
});

// Route to get historical data for a specific asset
router.get('/historical-data', (req, res) => {
  try {
    const { asset, startDate, endDate } = req.query;
    
    if (!asset) {
      return res.status(400).json({ error: 'Asset name is required' });
    }
    
    const uploadDir = path.join(__dirname, '../uploads/historical-data');
    
    // Check if directory exists
    if (!fs.existsSync(uploadDir)) {
      return res.status(404).json({ error: 'No historical data found' });
    }
    
    // Find the most recent file for this asset
    const files = fs.readdirSync(uploadDir);
    const assetFiles = files.filter(file => file.startsWith(`${asset}_`));
    
    if (assetFiles.length === 0) {
      return res.status(404).json({ error: `No historical data found for ${asset}` });
    }
    
    // Sort by timestamp (descending)
    assetFiles.sort((a, b) => {
      const timestampA = parseInt(a.split('_')[1]);
      const timestampB = parseInt(b.split('_')[1]);
      return timestampB - timestampA;
    });
    
    // Use the most recent file
    const mostRecentFile = assetFiles[0];
    const filePath = path.join(uploadDir, mostRecentFile);
    
    // Parse CSV file
    const results: any[] = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Convert CSV fields to standard format
        const timestamp = data.timestamp || data.Timestamp || data.time || data.Time || data.date || data.Date;
        
        if (!timestamp) {
          console.warn('Skipping row with missing timestamp');
          return;
        }
        
        // Parse numeric fields
        const open = parseFloat(data.open || data.Open || data.o || data.O || 0);
        const high = parseFloat(data.high || data.High || data.h || data.H || 0);
        const low = parseFloat(data.low || data.Low || data.l || data.L || 0);
        const close = parseFloat(data.close || data.Close || data.c || data.C || 0);
        const volume = parseFloat(data.volume || data.Volume || data.v || data.V || 0);
        
        // Check if this data point is within the requested date range
        if (startDate || endDate) {
          const dataDate = new Date(timestamp);
          
          if (startDate && new Date(startDate as string) > dataDate) {
            return;
          }
          
          if (endDate && new Date(endDate as string) < dataDate) {
            return;
          }
        }
        
        // Add standardized data point to results
        results.push({
          timestamp,
          open,
          high,
          low,
          close,
          volume
        });
      })
      .on('end', () => {
        // Sort by timestamp
        results.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        
        res.json(results);
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error);
        res.status(500).json({ error: 'Failed to parse historical data' });
      });
    
  } catch (error) {
    console.error('Error retrieving historical data:', error);
    res.status(500).json({ error: 'Failed to retrieve historical data' });
  }
});

// Route to update Google Sheet with analysis results
router.post('/update-sheet', async (req, res) => {
  try {
    const { spreadsheetId, sheetName, results } = req.body;
    
    if (!spreadsheetId || !sheetName || !results || !Array.isArray(results)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters: spreadsheetId, sheetName, and results array' 
      });
    }
    
    // Get Google Sheets API client
    const { sheets } = await getGoogleSheetsAuth();
    
    // First, get the current sheet data to find the correct rows to update
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    
    const rows = response.data.values || [];
    
    // Find the header row to map column names
    if (rows.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Sheet is empty or has no headers' 
      });
    }
    
    const headers = rows[0];
    
    // Find column indices for the fields we need to update
    const signalIdColumnIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes('id') || h.toLowerCase().includes('signal')
    );
    
    const outcomeColumnIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes('outcome') || h.toLowerCase().includes('result') || h.toLowerCase().includes('status')
    );
    
    const pnlColumnIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes('pnl') || h.toLowerCase().includes('profit') || h.toLowerCase().includes('p&l')
    );
    
    const pnlPercentColumnIndex = headers.findIndex(
      (h: string) => h.toLowerCase().includes('pnl %') || h.toLowerCase().includes('profit %') || h.toLowerCase().includes('p&l %')
    );
    
    // If outcome column doesn't exist, try to add it
    if (outcomeColumnIndex === -1) {
      // Add new column "Outcome" to the sheet
      const newHeaders = [...headers, 'Outcome'];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:${String.fromCharCode(65 + newHeaders.length - 1)}1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [newHeaders]
        }
      });
      
      // Update headers and indices after adding the new column
      outcomeColumnIndex = newHeaders.length - 1;
    }
    
    // Prepare batch update
    const updates = [];
    
    for (const result of results) {
      // Find the row for this signal
      const rowIndex = rows.findIndex((row: any, index: number) => {
        // Skip header row
        if (index === 0) return false;
        
        // Check if this is the right signal
        // Make sure the signalIdColumnIndex exists and row has that many columns
        if (signalIdColumnIndex >= 0 && row.length > signalIdColumnIndex) {
          return row[signalIdColumnIndex] === result.signalId;
        }
        
        return false;
      });
      
      if (rowIndex === -1) {
        console.warn(`Signal ${result.signalId} not found in sheet`);
        continue;
      }
      
      // Update outcome column
      if (outcomeColumnIndex >= 0) {
        updates.push({
          range: `${sheetName}!${String.fromCharCode(65 + outcomeColumnIndex)}${rowIndex + 1}`,
          values: [[result.outcome]]
        });
      }
      
      // Update PnL column if it exists and we have a value
      if (pnlColumnIndex >= 0 && result.pnl !== undefined) {
        updates.push({
          range: `${sheetName}!${String.fromCharCode(65 + pnlColumnIndex)}${rowIndex + 1}`,
          values: [[result.pnl]]
        });
      }
      
      // Update PnL % column if it exists and we have a value
      if (pnlPercentColumnIndex >= 0 && result.pnlPercentage !== undefined) {
        updates.push({
          range: `${sheetName}!${String.fromCharCode(65 + pnlPercentColumnIndex)}${rowIndex + 1}`,
          values: [[result.pnlPercentage]]
        });
      }
    }
    
    // If we have updates, perform batch update
    if (updates.length > 0) {
      await Promise.all(updates.map(update => 
        sheets.spreadsheets.values.update({
          spreadsheetId,
          range: update.range,
          valueInputOption: 'RAW',
          requestBody: {
            values: update.values
          }
        })
      ));
    }
    
    res.json({ success: true, message: `Updated ${updates.length} cells in Google Sheet` });
  } catch (error) {
    console.error('Error updating Google Sheet:', error);
    res.status(500).json({ success: false, message: 'Failed to update Google Sheet' });
  }
});

export default router;