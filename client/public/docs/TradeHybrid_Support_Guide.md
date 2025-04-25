# TradeHybrid Support Guide

## Introduction

This guide provides detailed troubleshooting steps for common user issues with TradeHybrid platform. It includes step-by-step resolution procedures, FAQs, and reference material for support staff.

## Wallet Connection Issues

### Issue: Black Screen After Wallet Connection

**Symptoms:**
- User connects wallet and sees a black screen
- Console shows error related to "Buffer is not defined"

**Resolution Steps:**
1. Ask the user to refresh the page
2. If the issue persists, clear browser cache and cookies
3. Ensure the user has the latest version of the Phantom wallet extension
4. Try an alternative browser (Chrome or Firefox recommended)

**Root Cause:** 
This is typically caused by a client-side JavaScript dependency conflict where Node.js Buffer API is not properly polyfilled in the browser environment.

### Issue: Failed Wallet Connection

**Symptoms:**
- Error message "Unable to connect to wallet"
- Wallet popup appears but connection never completes

**Resolution Steps:**
1. Verify the wallet is unlocked
2. Check if the wallet has sufficient SOL for transaction fees (at least 0.01 SOL)
3. Try the legacy connection method:
   - Direct them to disconnect any current wallet connection
   - Click "Connect Wallet" again and select Phantom
   - If using mobile, suggest using the in-app browser of the Phantom app
4. For persistent issues, suggest clearing browser permissions for the site and reconnecting

**Root Cause:**
Usually related to wallet extension state, permissions issues, or network connectivity problems.

### Issue: RPC Connection Errors

**Symptoms:**
- Error messages about "Failed to fetch" or "Network error"
- Transactions fail to process

**Resolution Steps:**
1. Verify the user's internet connection
2. Suggest switching to a different network location
3. Check [Solana network status](https://status.solana.com) for outages
4. If the issue is widespread, escalate to engineering team to check our RPC provider

**Root Cause:**
May be caused by Solana network congestion, RPC endpoint limitations, or user's network issues.

## Trading Signal Issues

### Issue: No Signals Appearing

**Symptoms:**
- Signal list is empty
- User reports "No signals found" message

**Resolution Steps:**
1. Verify user's membership tier (check `tokenMembership.tier` in their profile)
2. For free tier users, explain that only 2 public signals are available
3. For paid users:
   - Check if signal filters are active (reset filters using the "Clear Filters" button)
   - Verify the user's internet connection
   - Try manually refreshing signals with the refresh button
4. If the issue persists, check API status and escalate if needed

**Root Cause:**
Usually related to membership restrictions, active filters, or API connectivity issues.

### Issue: Copy Trade Function Not Working

**Symptoms:**
- "Copy Trade" button doesn't respond
- Copy action completes but nothing is copied to clipboard

**Resolution Steps:**
1. Confirm the user has granted clipboard permissions to the browser
2. For iOS Safari users, explain clipboard limitations and suggest using the manual copy option
3. Try using the "Copy" button in an expanded signal card instead of the quick action
4. If using a secure browser, suggest disabling enhanced security features or using a different browser

**Root Cause:**
Browser security policies often restrict clipboard access unless specific permissions are granted.

### Issue: Incorrect Signal Status

**Symptoms:**
- Signal shows as "active" when it should be completed or vice versa
- Profit/loss calculation seems incorrect

**Resolution Steps:**
1. Verify if the user is looking at the correct timestamp for the signal
2. Check if the signal was recently updated (within the last 5 minutes)
3. Ask them to try refreshing the signal list
4. For persistent issues, collect signal ID and user details and escalate to the signals team

**Root Cause:**
Signal status is usually updated every 5 minutes. Issues may occur due to caching or data synchronization delays.

## Account and Billing Issues

### Issue: Membership Benefits Not Active

**Symptoms:**
- User has purchased a higher tier but still sees limited features
- Premium signals not visible after upgrade

**Resolution Steps:**
1. Verify the payment was successfully processed (check transaction hash if crypto payment)
2. Check the user's current membership tier in the admin panel
3. Ask them to sign out and sign back in to refresh their session
4. For THC token purchases, verify the tokens were correctly received in our treasury wallet
5. If all checks pass but issue persists, manually update their membership tier and escalate

**Root Cause:**
Usually related to payment processing delays or session caching issues.

### Issue: THC Token Balance Not Updating

**Symptoms:**
- User has sent THC tokens but balance doesn't reflect the new amount
- Staking rewards not appearing

**Resolution Steps:**
1. Verify the transaction on Solana Explorer using the tx hash
2. Check if the transaction was sent to the correct wallet address
3. For confirmed transactions not showing, ask them to refresh their wallet connection
4. For staking rewards, explain the distribution schedule (daily at 00:00 UTC)

**Root Cause:**
Token balance synchronization happens at regular intervals and may not reflect immediately after transactions.

## Performance Issues

### Issue: Slow Chart Loading

**Symptoms:**
- Charts take a long time to render
- Frequent timeouts when changing timeframes

**Resolution Steps:**
1. Suggest reducing the number of active indicators (limit to 3-5)
2. Try using a simpler chart type (line chart instead of candlestick)
3. For mobile users, recommend switching to WiFi if on cellular data
4. Clear browser cache and reload

**Technical Details:**
Chart rendering is resource-intensive, especially with multiple indicators. Performance is impacted by:
- Device processing power
- Memory availability
- Network connection quality
- Number of active data subscriptions

### Issue: Mobile App Crashes

**Symptoms:**
- App closes unexpectedly when opening certain pages
- Freezes when changing chart settings

**Resolution Steps:**
1. Verify app version is latest (current: 2.5.0)
2. Suggest force-closing the app and restarting
3. Check device free storage (need minimum 500MB)
4. For persistent issues, collect device information and app logs

**Root Cause:**
Most mobile crashes are related to memory limitations or unhandled edge cases in the mobile wrapper.

## Data and Analytics Issues

### Issue: Missing Historical Data

**Symptoms:**
- Gaps in chart history
- Error message about "data not available"

**Resolution Steps:**
1. Verify the requested timeframe (explain that some assets have limited history)
2. For crypto assets, we store maximum of 2 years of historical data
3. For forex and stocks, data availability depends on the broker connection
4. Suggest trying a different timeframe or data source

**Root Cause:**
Historical data availability varies by asset type, data provider, and timeframe.

### Issue: Signal Performance Discrepancies

**Symptoms:**
- User reports different profit/loss than what's shown
- Signal metrics don't match actual market movements

**Resolution Steps:**
1. Explain that signal performance is based on entry and exit at exact signal prices
2. Actual execution may vary based on slippage, spreads, and execution timing
3. For significant discrepancies, request screenshots and escalate to the signals team

**Root Cause:**
Signal performance calculation uses standardized metrics, which may differ from actual trading results due to execution factors.

## Common User Questions

### Q: How are trading signals generated?

**Answer:** TradeHybrid signals come from three primary sources:
1. AI algorithms analyzing market patterns and sentiment
2. Professional traders partnered with TradeHybrid
3. Aggregated community signals filtered by success rate

Each signal includes a confidence rating and risk assessment based on historical performance.

### Q: What happens if I lose connection during a trade?

**Answer:** TradeHybrid operates primarily as a signal provider, not an execution platform. Your trades execute through your connected broker. If you lose connection:

1. Orders already placed with your broker will still execute
2. Pending orders in TradeHybrid that haven't been sent won't be executed
3. Copy trading automation will pause until connection is restored

We recommend setting appropriate stop losses with your broker for risk management.

### Q: How do I reset my wallet connection?

**Answer:** To reset your wallet connection:
1. Go to Settings > Security > Wallet Connections
2. Click "Disconnect Wallet"
3. Clear site permissions in your wallet extension
4. Refresh the page and reconnect

This resolves most connection issues by establishing a fresh authentication session.

### Q: Can I use multiple wallets with one account?

**Answer:** Yes, TradeHybrid supports connecting multiple wallets to a single account:
1. First, connect your primary wallet
2. Go to Settings > Wallet Management > Add Additional Wallet
3. Follow the connection process for the secondary wallet
4. Verify both wallets appear in your wallet list

Each wallet's assets will be displayed separately in your portfolio.

## Technical Reference

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| SOLANA_RPC_URL | Custom Solana RPC endpoint | https://solana-mainnet.g.alchemy.com/v2/demo |
| ALPACA_API_KEY | Alpaca broker API key | - |
| ALPACA_API_SECRET | Alpaca broker API secret | - |
| OANDA_API_KEY | OANDA broker API key | - |
| OPENAI_API_KEY | OpenAI API key for market analysis | - |

### Wallet Connection Process

1. User initiates connection from UI
2. System checks for wallet availability using both:
   - Modern: `window.phantom?.solana`
   - Legacy: `window.solana?.isPhantom`
3. Connection request sent to available wallet
4. Upon approval, signature request sent for authentication
5. After successful signature, JWT token generated for session

### Signal Status Lifecycle

1. **Created**: Signal is first generated by source
2. **Active**: Signal is currently valid and within trading parameters
3. **Completed**: Signal has reached take profit or stop loss
4. **Cancelled**: Signal was invalidated before completion
5. **Expired**: Signal reached time limit without triggering

Each status change triggers notifications and updates performance metrics.

## Escalation Procedures

### When to Escalate

- User reports data loss or account security concerns
- Payment processing issues involving more than $100
- System-wide outages affecting multiple users
- Bugs that prevent core functionality from working

### How to Escalate

1. Document the issue with:
   - User ID and email
   - Exact error messages
   - Steps to reproduce
   - Screenshots if available
2. Create an escalation ticket in Zendesk with priority tag
3. For urgent issues, use the #support-urgent Slack channel
4. Follow up with the user with ticket number and ETA

### After-Hours Support

For issues requiring immediate attention outside regular hours:
1. Check the on-call schedule in PagerDuty
2. Contact the assigned engineer via the emergency contact system
3. Use severity level "Critical" only for issues affecting:
   - User fund security
   - System-wide outages
   - Data integrity problems