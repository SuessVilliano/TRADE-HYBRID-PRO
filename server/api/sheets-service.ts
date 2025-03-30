import { google } from 'googleapis';
import { prisma } from '../lib/db';
import { BrokerService } from '../lib/services/broker-service';
import { SheetsSignal, SignalSource } from '../types';


export class SheetsService {
  private sheets;
  private broker: BrokerService;

  constructor() {
    this.sheets = google.sheets({ version: 'v4' });
    this.broker = new BrokerService();
  }

  async processSignals(spreadsheetId: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Signals!A:F',
      });

      const rows = response.data.values;
      if (rows?.length) {
        const signals = rows.map(row => ({
          symbol: row[0],
          type: row[1],
          entry: parseFloat(row[2]),
          stopLoss: parseFloat(row[3]),
          takeProfit: parseFloat(row[4]),
          timestamp: new Date(row[5])
        }));

        await this.broker.processSignalBatch(signals);
      }
    } catch (error) {
      console.error('Error processing signals:', error);
    }
  }
}


//Keeping this part, as it might be used elsewhere
export const SIGNAL_SOURCES: SignalSource[] = [
  {
    name: 'solaris',
    sheetId: process.env.SOLARIS_SHEET_ID || '',
    range: 'Signals!A2:H',
    defaultBroker: 'oanda'
  },
  {
    name: 'paradox',
    sheetId: process.env.PARADOX_SHEET_ID || '',
    range: 'Signals!A2:H',
    defaultBroker: 'alpaca'
  }
];

//This needs to be adapted or removed completely depending on how processSignals is used.
//export const sheetsService = new SheetsService();