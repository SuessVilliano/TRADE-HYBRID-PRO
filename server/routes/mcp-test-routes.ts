/**
 * MCP Test Routes
 * 
 * These routes are used to test the MCP server functionality.
 */

import express from 'express';
import { testMCPSignal, testMCPSignalUpdate, testMCPNotification } from '../api/mcp-test';

const router = express.Router();

// Test sending a signal through the MCP system
router.get('/signal', testMCPSignal);

// Test sending a signal status update through the MCP system
router.get('/signal-update', testMCPSignalUpdate);

// Test sending a system notification through the MCP system
router.get('/notification', testMCPNotification);

export default router;