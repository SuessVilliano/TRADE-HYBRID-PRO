
import { google } from 'googleapis';

export class SheetsService {
  private auth;
  
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
  }

  async getSignals(sheetId: string, range: string) {
    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range,
      });
      
      return response.data.values;
    } catch (error) {
      console.error('Error fetching signals from sheets:', error);
      throw error;
    }
  }
}

export const sheetsService = new SheetsService();
