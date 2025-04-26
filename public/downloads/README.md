# Trade Hybrid NinjaTrader Adapter

## Overview

The Trade Hybrid NinjaTrader Adapter is a desktop application that establishes a secure connection between the Trade Hybrid platform and your NinjaTrader installation. This adapter allows you to receive trading signals from Trade Hybrid and automatically execute them in NinjaTrader.

## Installation

### Requirements
- Windows 10 or Windows 11
- NinjaTrader 8 installed and configured
- .NET Framework 4.7.2 or later
- Internet connection

### Installation Steps
1. Download the installer package from Trade Hybrid
2. Extract the ZIP file to a location of your choice
3. Run the `TradeHybrid_Setup.exe` file and follow the on-screen instructions
4. After installation, launch the Trade Hybrid NinjaTrader Adapter from your desktop or Start menu

## Configuration

### Initial Setup
1. Launch the NinjaTrader Adapter
2. Enter your API Key from your Trade Hybrid account
3. Specify the path to your NinjaTrader installation (optional, it can be auto-detected)
4. Click "Connect to NinjaTrader"

### Connection Status
The connection status indicator shows the current state of your adapter:
- Red: Disconnected
- Yellow: Connecting
- Green: Connected and receiving signals

## Usage

When connected, the adapter will:
1. Maintain a secure WebSocket connection to Trade Hybrid
2. Receive real-time trading signals
3. Forward signals to NinjaTrader for execution
4. Log all activities in the Activity Log panel

## Troubleshooting

If you encounter issues:
1. Check that NinjaTrader is running
2. Verify your API key is correct
3. Ensure your internet connection is stable
4. Check the Activity Log for specific error messages
5. Restart the adapter and/or NinjaTrader

## Support

For additional help, contact Trade Hybrid support at:
- support@tradehybrid.club
- https://tradehybrid.club/support

## Security Notes

- The adapter uses encrypted communication with Trade Hybrid servers
- Your NinjaTrader account credentials never leave your computer
- Signals are processed locally on your machine

## Version History

- 1.0.0: Initial release with basic signal processing
- 1.1.0: Added support for advanced order types
- 1.2.0: Improved connection stability and error handling