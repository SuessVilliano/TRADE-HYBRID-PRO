import { Request, Response } from 'express';
import axios from 'axios';
import { RAPIDAPI_PROVIDERS, getRapidAPIService, RapidAPIService } from '../services/rapidapi-service';

// Traditional market data provider endpoints
const PROVIDER_ENDPOINTS = {
  finnhub: 'https://finnhub.io/api/v1',
  polygon: 'https://api.polygon.io/v2',
  coinapi: 'https://rest.coinapi.io/v1',
  alpha_vantage: 'https://www.alphavantage.co/query',
  marketstack: 'https://api.marketstack.com/v1',
  iex_cloud: 'https://cloud.iexapis.com/stable',
  fmp: 'https://financialmodelingprep.com/api/v3',
  tradier: 'https://api.tradier.com/v1'
};

// Generic error handler
const handleError = (error: any, res: Response) => {
  console.error('Market data API error:', error);
  const status = error.response?.status || 500;
  const message = error.response?.data?.message || error.message || 'Unknown error';
  res.status(status).json({ error: message });
};

// Check if a provider is a RapidAPI provider
const isRapidAPIProvider = (provider: string): boolean => {
  return Object.keys(RAPIDAPI_PROVIDERS).includes(provider);
};

// Route handler for market data API
export default async function marketDataHandler(req: Request, res: Response) {
  const { provider } = req.params;
  const { apiKey, ...params } = req.query;
  
  // Check if provider is valid, either traditional or RapidAPI
  const isTraditionalProvider = provider && PROVIDER_ENDPOINTS[provider as keyof typeof PROVIDER_ENDPOINTS];
  const isRapidProvider = provider && isRapidAPIProvider(provider);
  
  if (!isTraditionalProvider && !isRapidProvider) {
    return res.status(400).json({ error: 'Invalid market data provider' });
  }
  
  if (!apiKey) {
    return res.status(400).json({ error: 'API key is required' });
  }
  
  // Handle RapidAPI providers differently
  if (isRapidProvider) {
    try {
      const rapidApiKey = apiKey as string;
      const rapidApiService = new RapidAPIService(rapidApiKey);
      
      // Extract endpoint from path
      const apiPath = req.path.replace(`/api/market-data/${provider}`, '');
      
      // Find the matching endpoint for this provider
      const providerInfo = RAPIDAPI_PROVIDERS[provider as keyof typeof RAPIDAPI_PROVIDERS];
      const endpointMatch = Object.entries(providerInfo.endpoints).find(([_, path]) => {
        return apiPath === path || apiPath === '/' + path;
      });
      
      if (!endpointMatch) {
        return res.status(400).json({ error: `Invalid endpoint for ${provider}` });
      }
      
      const endpointKey = endpointMatch[0];
      const endpointPath = endpointMatch[1];
      
      // Make the RapidAPI request
      const response = await rapidApiService.makeRequest(
        provider as keyof typeof RAPIDAPI_PROVIDERS,
        endpointPath,
        params as Record<string, any>
      );
      
      return res.status(200).json(response);
    } catch (error) {
      return handleError(error, res);
    }
  }
  
  // Handle traditional providers
  try {
    const baseUrl = PROVIDER_ENDPOINTS[provider as keyof typeof PROVIDER_ENDPOINTS];
    const endpoint = req.path.replace(`/api/market-data/${provider}`, '');
    
    // Construct the provider-specific request
    let requestConfig = {};
    
    switch (provider) {
      case 'finnhub':
        requestConfig = {
          url: `${baseUrl}${endpoint}`,
          params,
          headers: { 'X-Finnhub-Token': apiKey }
        };
        break;
        
      case 'polygon':
        requestConfig = {
          url: `${baseUrl}${endpoint}`,
          params: { ...params, apiKey }
        };
        break;
        
      case 'coinapi':
        requestConfig = {
          url: `${baseUrl}${endpoint}`,
          params,
          headers: { 'X-CoinAPI-Key': apiKey }
        };
        break;
        
      case 'alpha_vantage':
        requestConfig = {
          url: `${baseUrl}`,
          params: { ...params, apikey: apiKey, function: endpoint.replace('/', '') }
        };
        break;
        
      case 'marketstack':
        requestConfig = {
          url: `${baseUrl}${endpoint}`,
          params: { ...params, access_key: apiKey }
        };
        break;
        
      case 'iex_cloud':
        requestConfig = {
          url: `${baseUrl}${endpoint}`,
          params: { ...params, token: apiKey }
        };
        break;
        
      case 'fmp':
        requestConfig = {
          url: `${baseUrl}${endpoint}`,
          params: { ...params, apikey: apiKey }
        };
        break;
        
      case 'tradier':
        requestConfig = {
          url: `${baseUrl}${endpoint}`,
          params,
          headers: { 'Authorization': `Bearer ${apiKey}`, 'Accept': 'application/json' }
        };
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported market data provider' });
    }
    
    // Make the request to the market data provider
    const response = await axios(requestConfig as any);
    
    // Return the data
    return res.status(200).json(response.data);
  } catch (error) {
    return handleError(error, res);
  }
}