# Trade Hybrid NinjaTrader Connector - Installation Guide

This guide will help you install and set up the Trade Hybrid NinjaTrader Connector. This connector allows Trade Hybrid to send trade signals to your NinjaTrader 8 platform for automated trade execution.

## Prerequisites

- NinjaTrader 8 installed on your computer
- Active trading account configured in NinjaTrader
- Trade Hybrid account with proper permissions

## Installation Steps

### 1. Download the NinjaTrader Connector Script

The NinjaTrader connector file (`TradeHybridNinjaConnector.cs`) should be installed as a NinjaScript add-on in your NinjaTrader 8 platform.

### 2. Import the NinjaScript into NinjaTrader

1. Open NinjaTrader 8
2. Click on the "Tools" menu
3. Select "Import" > "NinjaScript Add-On..."
4. Browse to the location where you saved the `TradeHybridNinjaConnector.cs` file
5. Select the file and click "Open"
6. Follow the prompts to complete the import

### 3. Enable the Connector Add-On

1. In NinjaTrader 8, click on the "NinjaScript" menu
2. Select "Add-Ons"
3. Find "Trade Hybrid Connector" in the list
4. Check the box to enable it
5. The connector window should appear on your screen

### 4. Configure the Connector

In the connector window:

1. **Port**: By default, the connector runs on port 8081. You can change this if needed.
2. **API Key**: For security, set an API key that will be required for all API calls.
3. **Account**: Select the NinjaTrader account you want to use for trading.

### 5. Connect Trade Hybrid to NinjaTrader

1. Log in to your Trade Hybrid account
2. Go to "Broker Connections" in the settings
3. Click "Add NinjaTrader Connection"
4. Enter the following information:
   - Endpoint: `http://localhost:8081` (or your custom port)
   - API Key: The same key you set in the connector
   - Account: Your NinjaTrader account name (optional)
5. Click "Test Connection" to verify everything is working
6. Save the connection

## Using the Connector

Once installed and configured, the connector will:

1. Run in the background of NinjaTrader
2. Listen for trade signals from Trade Hybrid
3. Execute trades in your NinjaTrader account
4. Display a log of all received signals and trade executions

Keep the connector window open while you want to receive signals from Trade Hybrid.

## Troubleshooting

### Common Issues

1. **Connection Failed**: Make sure NinjaTrader is running and the connector is enabled. Check that the port is not blocked by your firewall.

2. **API Key Errors**: Ensure the API key in Trade Hybrid matches exactly what you set in the connector.

3. **Order Execution Failures**: Verify that your NinjaTrader account is properly set up and connected to your broker.

4. **Instrument Not Found**: Make sure the symbol format used in Trade Hybrid matches what NinjaTrader expects.

### Getting Help

If you encounter issues that aren't covered here, please contact Trade Hybrid support through your account dashboard.

## Security Notes

- The connector only accepts connections from your local computer by default.
- Using an API key is strongly recommended to prevent unauthorized access.
- The connector does not store or transmit your NinjaTrader login credentials.
- All communication between Trade Hybrid and the connector is done through encrypted HTTPS (when configured on the Trade Hybrid side).

---

© 2025 Trade Hybrid Platform. All rights reserved.