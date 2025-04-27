import axios from 'axios';
import { UserContext, initialUserContext, BrokerCredentials } from '../../../shared/models/UserContext';
import { useUserStore } from '../stores/useUserStore';
import { useSignals } from '../stores/useSignals';

// Base URL for API requests
const API_BASE_URL = '/api';

/**
 * Unified User Service
 * 
 * This service provides a central interface for fetching and managing user data
 * from various backend endpoints. It centralizes data access and transformations
 * to ensure consistent user data across the application.
 */

/**
 * Fetch all user data from different endpoints and consolidate into UserContext
 */
export async function fetchUserData(): Promise<UserContext> {
  try {
    // Get user ID from session or local store
    const userId = useUserStore.getState().user?.id;
    
    if (!userId) {
      console.log('User not authenticated, returning initial context');
      return { ...initialUserContext, authenticated: false };
    }
    
    // Start with authenticated user context
    const userData: UserContext = {
      ...initialUserContext,
      userId,
      authenticated: true,
    };
    
    // Load user profile data
    try {
      const profileResponse = await axios.get(`${API_BASE_URL}/users/${userId}/profile`);
      if (profileResponse.data.success) {
        // Update membership and basic data
        userData.membershipLevel = profileResponse.data.profile.membershipLevel || 'free';
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
    
    // Load wallet data
    try {
      const walletResponse = await axios.get(`${API_BASE_URL}/users/${userId}/wallet`);
      userData.walletConnected = walletResponse.data.walletConnected || false;
      if (walletResponse.data.walletConnected) {
        userData.walletProvider = 'phantom'; // Default to Phantom unless specified
        userData.walletData = walletResponse.data;
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
    
    // Load connected brokers
    try {
      const brokersResponse = await axios.get(`${API_BASE_URL}/users/${userId}/brokers`);
      userData.connectedBrokers = brokersResponse.data.map((broker: any) => ({
        id: broker.id,
        name: broker.name,
        isDemo: broker.isDemo,
        lastSynced: new Date(broker.lastSynced),
        status: broker.status,
        accountIds: broker.accountIds || [],
        credentials: {
          brokerId: broker.id,
          useDemo: broker.isDemo,
        } as BrokerCredentials
      }));
    } catch (error) {
      console.error('Error fetching connected brokers:', error);
    }
    
    // Load saved trading signals
    try {
      const signalsResponse = await axios.get(`${API_BASE_URL}/users/${userId}/signals`);
      if (signalsResponse.data.success) {
        userData.savedTradingSignals = signalsResponse.data.signals.map((signal: any) => ({
          id: signal.id,
          symbol: signal.symbol,
          type: signal.side === 'buy' ? 'buy' : 'sell',
          entry: signal.entryPrice || 0,
          stopLoss: signal.stopLoss || 0,
          takeProfit: signal.takeProfit || 0,
          timestamp: new Date(signal.timestamp),
          source: signal.providerId || 'manual',
          risk: signal.risk || 1,
          notes: signal.description || '',
          timeframe: signal.timeframe || '1d',
          status: signal.status || 'active',
          confidence: calculateConfidence(signal),
        }));
      }
    } catch (error) {
      console.error('Error fetching saved signals:', error);
    }
    
    // Load journal entries
    try {
      const journalResponse = await axios.get(`${API_BASE_URL}/users/${userId}/journal`);
      userData.journalEntries = journalResponse.data.map((entry: any) => ({
        id: entry.id,
        timestamp: new Date(entry.timestamp || entry.createdAt),
        title: entry.title,
        content: entry.content,
        mood: entry.mood || 'neutral',
        tags: entry.tags || [],
        tradeIds: entry.tradeIds || [],
        attachments: entry.attachments || [],
        isPrivate: typeof entry.isPrivate === 'boolean' ? entry.isPrivate : true
      }));
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
    
    // Load webhooks
    try {
      const webhooksResponse = await axios.get(`${API_BASE_URL}/users/${userId}/webhooks`);
      userData.webhooks = webhooksResponse.data.map((webhook: any) => ({
        id: webhook.id,
        name: webhook.name,
        url: webhook.url,
        active: webhook.active,
        brokerTarget: webhook.brokerTarget,
        signalTarget: webhook.signalTarget,
        journalTarget: webhook.journalTarget,
        secret: webhook.secret,
        lastTriggered: webhook.lastTriggered ? new Date(webhook.lastTriggered) : undefined,
        createdAt: new Date(webhook.createdAt),
        customFields: webhook.customFields || {},
      }));
    } catch (error) {
      console.error('Error fetching webhooks:', error);
    }
    
    // Load AI analysis
    try {
      const analysisResponse = await axios.get(`${API_BASE_URL}/users/${userId}/analysis`);
      if (analysisResponse.data.success) {
        userData.aiAnalysis = {};
        analysisResponse.data.analysis.forEach((analysis: any) => {
          userData.aiAnalysis[analysis.symbol] = {
            id: analysis.id,
            timestamp: new Date(analysis.timestamp),
            symbol: analysis.symbol,
            timeframe: analysis.timeframe,
            direction: analysis.direction,
            confidence: analysis.confidence,
            signals: analysis.signals || [],
            supportLevels: analysis.supportLevels || [],
            resistanceLevels: analysis.resistanceLevels || [],
            keyMetrics: analysis.keyMetrics || {},
            summary: analysis.summary,
            prediction: analysis.prediction,
          };
        });
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error);
    }
    
    // Update last synced time
    userData.lastSynced = new Date();
    
    // Load favorite symbols from store
    const signalsState = useSignals.getState();
    if (signalsState.favoriteSymbols?.length > 0) {
      userData.favoriteSymbols = signalsState.favoriteSymbols;
    }
    
    console.log('Unified user data loaded:', userData);
    return userData;
  } catch (error) {
    console.error('Error fetching unified user data:', error);
    throw error;
  }
}

/**
 * Update user data in backend
 */
export async function updateUserData(userData: UserContext): Promise<boolean> {
  try {
    const userId = userData.userId || useUserStore.getState().user?.id;
    
    if (!userId) {
      console.error('User ID not available for update');
      return false;
    }
    
    // Only update specific parts of user data
    // For favorite symbols
    if (userData.favoriteSymbols) {
      try {
        await axios.post(`${API_BASE_URL}/users/${userId}/preferences`, {
          favoriteSymbols: userData.favoriteSymbols
        });
      } catch (error) {
        console.error('Failed to update favorite symbols:', error);
      }
    }
    
    // For preferences
    if (userData.preferences) {
      try {
        await axios.post(`${API_BASE_URL}/users/${userId}/preferences`, {
          preferences: userData.preferences
        });
      } catch (error) {
        console.error('Failed to update user preferences:', error);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    return false;
  }
}

/**
 * Connect a broker account
 */
export async function connectBroker(
  brokerId: string, 
  credentials: BrokerCredentials, 
  name: string = ''
): Promise<boolean> {
  try {
    const userId = useUserStore.getState().user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return false;
    }
    
    // Validate required fields
    if (!brokerId || !credentials) {
      console.error('Missing required broker data');
      return false;
    }
    
    // Prepare broker display name if not provided
    const brokerName = name || `${brokerId.charAt(0).toUpperCase() + brokerId.slice(1)} ${credentials.useDemo ? '(Demo)' : ''}`;
    
    // Connect to broker first to verify credentials
    const verifyResponse = await axios.post(`${API_BASE_URL}/brokers/verify-credentials`, {
      brokerId,
      credentials
    });
    
    if (!verifyResponse.data.success) {
      console.error('Failed to verify broker credentials:', verifyResponse.data.message);
      throw new Error(verifyResponse.data.message || 'Invalid broker credentials');
    }
    
    const accountInfo = verifyResponse.data.accountInfo;
    const accountId = accountInfo.accountId;
    
    // Register the broker connection
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/brokers`, {
      id: brokerId,
      name: brokerName,
      isDemo: credentials.useDemo || false,
      credentials,
      accountIds: accountId ? [accountId] : []
    });
    
    return response.data.success || false;
  } catch (error) {
    console.error('Error connecting broker:', error);
    throw error;
  }
}

/**
 * List available brokers for connection
 */
export async function listAvailableBrokers(): Promise<any[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/brokers/available`);
    return response.data.map((b: any) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      logoUrl: b.logo_url,
      requiresKey: b.requires_key,
      requiresSecret: b.requires_secret,
      requiresPassphrase: b.requires_passphrase,
      supportsDemo: b.supports_demo,
    }));
  } catch (error) {
    console.error('Error fetching available brokers:', error);
    return [];
  }
}

/**
 * Disconnect a broker account
 */
export async function disconnectBroker(brokerId: string, isDemo: boolean): Promise<boolean> {
  try {
    const userId = useUserStore.getState().user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return false;
    }
    
    await axios.delete(`${API_BASE_URL}/users/${userId}/brokers/${brokerId}?isDemo=${isDemo}`);
    return true;
  } catch (error) {
    console.error('Error disconnecting broker:', error);
    return false;
  }
}

/**
 * Save a trading signal
 */
export async function saveSignal(signal: any): Promise<boolean> {
  try {
    const userId = useUserStore.getState().user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return false;
    }
    
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/signals`, signal);
    return response.data.success || false;
  } catch (error) {
    console.error('Error saving signal:', error);
    return false;
  }
}

/**
 * Save a journal entry
 */
export async function saveJournalEntry(entry: any): Promise<boolean> {
  try {
    const userId = useUserStore.getState().user?.id;
    
    if (!userId) {
      console.error('User not authenticated');
      return false;
    }
    
    const response = await axios.post(`${API_BASE_URL}/users/${userId}/journal`, entry);
    return response.data.success || false;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    return false;
  }
}

/**
 * Calculate signal confidence score based on risk-reward ratio
 */
function calculateConfidence(signal: any): number {
  try {
    // If confidence is already provided, use it
    if (typeof signal.confidence === 'number') {
      return signal.confidence;
    }
    
    // No entry, stop loss, or take profit data
    if (!signal.entryPrice || !signal.stopLoss || !signal.takeProfit) {
      return 0.5; // Default medium confidence
    }
    
    const entry = parseFloat(signal.entryPrice);
    const stop = parseFloat(signal.stopLoss);
    const target = parseFloat(signal.takeProfit);
    
    // Invalid values
    if (isNaN(entry) || isNaN(stop) || isNaN(target)) {
      return 0.5;
    }
    
    // Calculate risk-reward ratio
    const risk = Math.abs(entry - stop);
    const reward = Math.abs(target - entry);
    
    if (risk === 0) return 0.5; // Avoid division by zero
    
    const riskRewardRatio = reward / risk;
    
    // Convert risk-reward ratio to confidence score (0-1)
    // Higher risk-reward ratio = higher confidence
    // 1:1 = 0.5, 2:1 = 0.7, 3:1 = 0.8, 5:1 = 0.9
    if (riskRewardRatio >= 5) return 0.9;
    if (riskRewardRatio >= 3) return 0.8;
    if (riskRewardRatio >= 2) return 0.7;
    if (riskRewardRatio >= 1) return 0.6;
    
    // Risk is higher than reward
    return 0.4;
  } catch (error) {
    console.error('Error calculating signal confidence:', error);
    return 0.5; // Default medium confidence
  }
}