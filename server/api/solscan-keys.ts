import { Router, Request, Response } from 'express';
import { SolanaBlockchainService } from '../mcp/services/solana-blockchain-service';

const router = Router();

// Get current Solscan API status
router.get('/status', async (req: Request, res: Response) => {
  try {
    // Get the Solana blockchain service instance
    const solanaService = SolanaBlockchainService.getInstance();
    
    // Check the status of the Solscan API by testing a basic request
    const apiStatus = await solanaService.getSolscanAPIStatus();
    
    return res.json({
      success: true,
      status: apiStatus.working ? 'working' : 'not working',
      message: apiStatus.message,
      useFallbackMode: apiStatus.useFallbackMode
    });
  } catch (error: any) {
    console.error('Error checking Solscan API status:', error);
    return res.status(500).json({
      success: false,
      status: 'error',
      message: error.message || 'An error occurred checking Solscan API status'
    });
  }
});

// Update Solscan API key
router.post('/update-key', async (req: Request, res: Response) => {
  try {
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API key is required'
      });
    }
    
    // Get the Solana blockchain service instance
    const solanaService = SolanaBlockchainService.getInstance();
    
    // Update the API key
    const updateResult = await solanaService.updateSolscanApiKey(apiKey);
    
    if (updateResult.success) {
      return res.json({
        success: true,
        message: 'Solscan API key updated successfully',
        status: updateResult.apiWorking ? 'working' : 'not working'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: updateResult.message || 'Failed to update Solscan API key'
      });
    }
  } catch (error: any) {
    console.error('Error updating Solscan API key:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred updating Solscan API key'
    });
  }
});

// Get current settings for the SolanaBlockchainService
router.get('/settings', async (req: Request, res: Response) => {
  try {
    // Get the Solana blockchain service instance
    const solanaService = SolanaBlockchainService.getInstance();
    
    // Get the current settings
    const settings = await solanaService.getServiceSettings();
    
    return res.json({
      success: true,
      settings: {
        useFallbackMethods: settings.useFallbackMethods,
        solscanApiAvailable: settings.solscanApiAvailable,
        cachingEnabled: settings.cachingEnabled,
        initialized: settings.initialized,
        fallbackRpcUrl: settings.fallbackRpcUrl ? "Available" : "Not configured"
      }
    });
  } catch (error: any) {
    console.error('Error getting Solana service settings:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred getting Solana service settings'
    });
  }
});

// Force refresh of cached THC token data
router.post('/refresh-token-cache', async (req: Request, res: Response) => {
  try {
    // Get the Solana blockchain service instance
    const solanaService = SolanaBlockchainService.getInstance();
    
    // Force update of THC token info
    await solanaService.forceUpdateTHCTokenInfo();
    
    // Get the current token info
    const tokenInfo = await solanaService.getTHCTokenInfo();
    
    return res.json({
      success: true,
      message: 'THC token info refreshed successfully',
      tokenInfo
    });
  } catch (error: any) {
    console.error('Error refreshing THC token info:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred refreshing THC token info'
    });
  }
});

// Toggle fallback mode
router.post('/toggle-fallback', async (req: Request, res: Response) => {
  try {
    const { enableFallback } = req.body;
    
    if (enableFallback === undefined) {
      return res.status(400).json({
        success: false,
        message: 'enableFallback parameter is required'
      });
    }
    
    // Get the Solana blockchain service instance
    const solanaService = SolanaBlockchainService.getInstance();
    
    // Set fallback mode
    const result = await solanaService.setFallbackMode(enableFallback === true);
    
    return res.json({
      success: true,
      message: `Fallback mode ${enableFallback ? 'enabled' : 'disabled'} successfully`,
      currentSettings: result
    });
  } catch (error: any) {
    console.error('Error toggling fallback mode:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred toggling fallback mode'
    });
  }
});

export default router;