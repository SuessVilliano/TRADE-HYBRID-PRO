import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { InfoIcon, ExternalLink, Shield } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const BrokerIntegrationDocs: React.FC = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Broker Integration Documentation</CardTitle>
        <CardDescription>
          Learn how to connect and use each supported broker with Trade Hybrid
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList className="w-full mb-4 grid grid-cols-5 sm:grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="alpaca">Alpaca</TabsTrigger>
            <TabsTrigger value="ibkr">IBKR</TabsTrigger>
            <TabsTrigger value="oanda">Oanda</TabsTrigger>
            <TabsTrigger value="metatrader">MT4/MT5</TabsTrigger>
            <TabsTrigger value="tradingview">TradingView</TabsTrigger>
            <TabsTrigger value="more">More</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[450px] rounded-md pr-4">
            <TabsContent value="overview" className="px-2">
              <h3 className="text-lg font-semibold mb-2">Broker Integration Overview</h3>
              <p className="mb-4">
                Trade Hybrid's Nexus system allows you to connect with multiple brokers to execute 
                trades, monitor positions, and implement advanced trading strategies across different markets.
              </p>
              
              <Alert className="mb-4">
                <InfoIcon className="h-4 w-4 mr-2" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Your API credentials are encrypted and stored securely. We never store your full API keys in plain text.
                </AlertDescription>
              </Alert>
              
              <h4 className="text-md font-semibold mb-2">General Connection Process:</h4>
              <ol className="ml-6 list-decimal mb-4 space-y-2">
                <li>Create an API key/secret pair from your broker's developer portal</li>
                <li>Configure appropriate permissions (read, trade, etc.)</li>
                <li>Enter your credentials in Trade Hybrid's broker settings</li>
                <li>Choose between demo/paper trading or live trading account</li>
                <li>Test the connection to ensure everything is working</li>
                <li>Start trading through the Nexus system</li>
              </ol>
              
              <Alert className="mb-4 border-blue-500">
                <InfoIcon className="h-4 w-4 mr-2" />
                <AlertTitle>Demo Account Support</AlertTitle>
                <AlertDescription>
                  Most brokers offer demo or paper trading accounts for practice. We recommend starting with a demo account to test your strategies before using real funds. Toggle the demo account option when connecting your broker.
                </AlertDescription>
              </Alert>
              
              <h4 className="text-md font-semibold mb-2">Security Practices:</h4>
              <ul className="ml-6 list-disc mb-4 space-y-2">
                <li>All API credentials are encrypted at rest</li>
                <li>End-to-end encryption during transmission</li>
                <li>Periodic connection tests to ensure validity</li>
                <li>Automatic lockout after inactivity</li>
                <li>Option to use read-only API keys for monitoring</li>
              </ul>
              
              <h4 className="text-md font-semibold mb-2">Supported Features by Broker Type:</h4>
              <div className="relative overflow-x-auto rounded-md border mb-4">
                <table className="w-full text-sm">
                  <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left">Broker</th>
                      <th scope="col" className="px-6 py-3 text-center">Market Data</th>
                      <th scope="col" className="px-6 py-3 text-center">Trading</th>
                      <th scope="col" className="px-6 py-3 text-center">Account Info</th>
                      <th scope="col" className="px-6 py-3 text-center">Webhook Support</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">Alpaca</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">Interactive Brokers</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">Limited</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">Oanda</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">MetaTrader (MT4/MT5)</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">✓</td>
                      <td className="px-6 py-4 text-center">Via MetaAPI</td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                      <td className="px-6 py-4">TradingView</td>
                      <td className="px-6 py-4 text-center">Read-only</td>
                      <td className="px-6 py-4 text-center">Via Webhook</td>
                      <td className="px-6 py-4 text-center">Limited</td>
                      <td className="px-6 py-4 text-center">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="alpaca" className="px-2">
              <h3 className="text-lg font-semibold mb-2">Alpaca Integration</h3>
              <p className="mb-4">
                Alpaca provides commission-free trading APIs for stocks, ETFs, options, and crypto. 
                It's one of the most developer-friendly trading platforms with well-documented APIs.
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <a 
                  href="https://alpaca.markets/docs/api-documentation/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm flex items-center text-blue-600 hover:underline"
                >
                  Official API Documentation <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              
              <h4 className="text-md font-semibold mb-2">Setup Instructions:</h4>
              <ol className="ml-6 list-decimal mb-4 space-y-2">
                <li>Sign up for an Alpaca account at <a href="https://alpaca.markets" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">alpaca.markets</a></li>
                <li>Navigate to your Dashboard and select "API Keys"</li>
                <li>Create a new key pair (choose between Paper and Live trading)</li>
                <li>Copy your API Key and Secret Key</li>
                <li>Enter these credentials in Trade Hybrid's Broker Settings</li>
              </ol>
              
              <Alert className="mb-4">
                <Shield className="h-4 w-4 mr-2" />
                <AlertTitle>Security Best Practice</AlertTitle>
                <AlertDescription>
                  Start with Paper Trading to test your integration. Only switch to live trading after 
                  thorough testing.
                </AlertDescription>
              </Alert>
              
              <h4 className="text-md font-semibold mb-2">Supported Features:</h4>
              <ul className="ml-6 list-disc mb-4 space-y-2">
                <li>Real-time and historical market data</li>
                <li>Trading stocks, options, and crypto</li>
                <li>Account information and position tracking</li>
                <li>Advanced order types (market, limit, stop, trailing stop)</li>
                <li>Portfolio analytics</li>
                <li>Paper trading environment for testing</li>
              </ul>
              
              <h4 className="text-md font-semibold mb-2">Required Credentials:</h4>
              <div className="mb-4 pl-4 border-l-2 border-gray-200">
                <div className="mb-2">
                  <span className="font-semibold">API Key:</span> Your Alpaca API Key ID
                </div>
                <div className="mb-2">
                  <span className="font-semibold">API Secret:</span> Your Alpaca API Secret Key
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Paper Trading:</span> Toggle for using the paper trading environment
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ibkr" className="px-2">
              <h3 className="text-lg font-semibold mb-2">Interactive Brokers Integration</h3>
              <p className="mb-4">
                Interactive Brokers (IBKR) offers access to a wide range of global markets 
                with professional-grade execution. Their Client Portal API enables automated trading.
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <a 
                  href="https://interactivebrokers.github.io/cpapi/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm flex items-center text-blue-600 hover:underline"
                >
                  Client Portal API Documentation <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              
              <h4 className="text-md font-semibold mb-2">Setup Instructions:</h4>
              <ol className="ml-6 list-decimal mb-4 space-y-2">
                <li>Create or log in to your Interactive Brokers account</li>
                <li>Enable API access in Account Settings &gt; API Access</li>
                <li>Create API credentials and define access permissions</li>
                <li>Enter your IBKR credentials in Trade Hybrid's Broker Settings</li>
                <li>Ensure the IBKR Client Portal Gateway is running (for some features)</li>
              </ol>
              
              <Alert className="mb-4">
                <InfoIcon className="h-4 w-4 mr-2" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  IBKR requires the Client Portal Gateway for some operations. Make sure to set this up 
                  properly if using advanced features.
                </AlertDescription>
              </Alert>
              
              <h4 className="text-md font-semibold mb-2">Supported Features:</h4>
              <ul className="ml-6 list-disc mb-4 space-y-2">
                <li>Global market data across multiple asset classes</li>
                <li>Trading on 150+ global exchanges</li>
                <li>Full account information and portfolio management</li>
                <li>Advanced order types and strategies</li>
                <li>Access to futures, options, forex, bonds, and more</li>
                <li>Paper trading account for testing</li>
              </ul>
              
              <h4 className="text-md font-semibold mb-2">Required Credentials:</h4>
              <div className="mb-4 pl-4 border-l-2 border-gray-200">
                <div className="mb-2">
                  <span className="font-semibold">User ID:</span> Your IBKR account username
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Password:</span> Your IBKR account password (for Client Portal API)
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="oanda" className="px-2">
              <h3 className="text-lg font-semibold mb-2">Oanda Integration</h3>
              <p className="mb-4">
                Oanda is a leading forex and CFD broker with a robust REST API. It's particularly 
                popular for forex traders due to its competitive spreads and reliable execution.
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <a 
                  href="https://developer.oanda.com/rest-live-v20/introduction/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm flex items-center text-blue-600 hover:underline"
                >
                  v20 REST API Documentation <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              
              <h4 className="text-md font-semibold mb-2">Setup Instructions:</h4>
              <ol className="ml-6 list-decimal mb-4 space-y-2">
                <li>Create or log in to your Oanda account</li>
                <li>Navigate to "My Account" &gt; "API Access"</li>
                <li>Generate an API token for your account</li>
                <li>Copy your Account ID (visible in the Oanda platform)</li>
                <li>Enter these details in Trade Hybrid's Broker Settings</li>
              </ol>
              
              <Alert className="mb-4">
                <Shield className="h-4 w-4 mr-2" />
                <AlertTitle>Practice Account</AlertTitle>
                <AlertDescription>
                  Oanda offers practice accounts with virtual funds. Use these for testing before 
                  connecting your live trading account.
                </AlertDescription>
              </Alert>
              
              <h4 className="text-md font-semibold mb-2">Supported Features:</h4>
              <ul className="ml-6 list-disc mb-4 space-y-2">
                <li>Forex and CFD trading</li>
                <li>Real-time price streaming</li>
                <li>Historical candle data</li>
                <li>Account summary and position management</li>
                <li>Multiple order types (market, limit, stop, take profit)</li>
                <li>Trading from charts directly in Trade Hybrid</li>
              </ul>
              
              <h4 className="text-md font-semibold mb-2">Required Credentials:</h4>
              <div className="mb-4 pl-4 border-l-2 border-gray-200">
                <div className="mb-2">
                  <span className="font-semibold">API Token:</span> Your Oanda API access token
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Account ID:</span> Your Oanda account ID
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Practice Account:</span> Toggle for using a practice account
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="metatrader" className="px-2">
              <h3 className="text-lg font-semibold mb-2">MetaTrader (MT4/MT5) Integration</h3>
              <p className="mb-4">
                MetaTrader is the most popular trading platform for forex and CFD trading. 
                Trade Hybrid connects to MT4/MT5 platforms via the MetaAPI service.
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <a 
                  href="https://metaapi.cloud/docs/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm flex items-center text-blue-600 hover:underline"
                >
                  MetaAPI Documentation <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              
              <h4 className="text-md font-semibold mb-2">Setup Instructions:</h4>
              <ol className="ml-6 list-decimal mb-4 space-y-2">
                <li>Create a MetaAPI account at <a href="https://app.metaapi.cloud/register" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">metaapi.cloud</a></li>
                <li>Connect your MT4/MT5 terminal to MetaAPI</li>
                <li>Generate an API token in MetaAPI dashboard</li>
                <li>Create a connection to your MT4/MT5 account</li>
                <li>Copy the API token and account ID from MetaAPI</li>
                <li>Enter these credentials in Trade Hybrid's Broker Settings</li>
              </ol>
              
              <Alert className="mb-4">
                <InfoIcon className="h-4 w-4 mr-2" />
                <AlertTitle>MetaAPI Requirement</AlertTitle>
                <AlertDescription>
                  This integration uses MetaAPI as middleware. You'll need a MetaAPI account, which offers both 
                  free and paid tiers based on your usage.
                </AlertDescription>
              </Alert>
              
              <h4 className="text-md font-semibold mb-2">Supported Features:</h4>
              <ul className="ml-6 list-disc mb-4 space-y-2">
                <li>Connect to any MT4/MT5 broker</li>
                <li>Execute trades directly from Trade Hybrid</li>
                <li>Access your existing MetaTrader positions and orders</li>
                <li>Real-time price data and account information</li>
                <li>Use custom indicators from your MetaTrader platform</li>
                <li>Copy trading capabilities</li>
              </ul>
              
              <h4 className="text-md font-semibold mb-2">Required Credentials:</h4>
              <div className="mb-4 pl-4 border-l-2 border-gray-200">
                <div className="mb-2">
                  <span className="font-semibold">API Token:</span> Your MetaAPI token
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Account ID:</span> Your MetaAPI account ID
                </div>
                <div className="mb-2">
                  <span className="font-semibold">Connection Type:</span> MT4 or MT5
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="tradingview" className="px-2">
              <h3 className="text-lg font-semibold mb-2">TradingView Integration</h3>
              <p className="mb-4">
                TradingView is a powerful charting platform with alerting capabilities. 
                Trade Hybrid connects to TradingView via webhooks to enable automated trading 
                based on TradingView alerts.
              </p>
              
              <div className="flex items-center gap-2 mb-4">
                <a 
                  href="https://www.tradingview.com/support/solutions/43000529348-about-webhooks/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm flex items-center text-blue-600 hover:underline"
                >
                  TradingView Webhooks Documentation <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              
              <h4 className="text-md font-semibold mb-2">Setup Instructions:</h4>
              <ol className="ml-6 list-decimal mb-4 space-y-2">
                <li>Create a webhook in Trade Hybrid's Webhook Manager</li>
                <li>Copy the generated webhook URL</li>
                <li>In TradingView, create an alert on your chart</li>
                <li>Select "Webhook URL" as the alert notification method</li>
                <li>Paste your Trade Hybrid webhook URL</li>
                <li>Format your alert message according to our templates</li>
              </ol>
              
              <Separator className="my-4" />
              
              <h4 className="text-md font-semibold mb-2">Alert Message Templates:</h4>
              <p className="mb-2">Use these templates in your TradingView alert message:</p>
              
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded mb-4 font-mono text-sm whitespace-pre overflow-x-auto">
{`{
  "action": "{{strategy.order.action}}",
  "symbol": "{{ticker}}",
  "price": {{close}},
  "quantity": 1,
  "strategy": "{{strategy.name}}",
  "broker": "alpaca"  // Change to your target broker
}`}
              </div>
              
              <p className="mb-4">You can customize the message format and add more parameters as needed.</p>
              
              <Alert className="mb-4">
                <InfoIcon className="h-4 w-4 mr-2" />
                <AlertTitle>Target Broker</AlertTitle>
                <AlertDescription>
                  The "broker" field determines which of your connected brokers will execute the trade
                  triggered by TradingView alerts.
                </AlertDescription>
              </Alert>
              
              <h4 className="text-md font-semibold mb-2">Supported Features:</h4>
              <ul className="ml-6 list-disc mb-4 space-y-2">
                <li>Execute trades from TradingView alerts</li>
                <li>Compatible with Pine Script strategy alerts</li>
                <li>Custom message templates for different strategies</li>
                <li>Forward alerts to any connected broker</li>
                <li>Detailed logs of received webhooks</li>
                <li>Filter and validate incoming alerts</li>
              </ul>
            </TabsContent>
            
            <TabsContent value="more" className="px-2">
              <h3 className="text-lg font-semibold mb-2">Additional Supported Brokers</h3>
              <p className="mb-4">
                Trade Hybrid supports many other brokers in addition to the ones detailed in the other tabs.
                Here's a quick overview of each:
              </p>
              
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Tradier</h4>
                <p className="mb-2">
                  Tradier provides a REST API for US stocks and options trading with competitive pricing.
                </p>
                <div className="ml-4 mb-2">
                  <span className="font-semibold">Required:</span> Access Token
                </div>
                <div className="ml-4 mb-4">
                  <a 
                    href="https://documentation.tradier.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm flex items-center text-blue-600 hover:underline"
                  >
                    Tradier API Documentation <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">cTrader</h4>
                <p className="mb-2">
                  cTrader is a forex and CFD trading platform with an Open API for integration.
                </p>
                <div className="ml-4 mb-2">
                  <span className="font-semibold">Required:</span> API Key, API Secret, Account ID
                </div>
                <div className="ml-4 mb-4">
                  <a 
                    href="https://ctrader.com/open-api-guide/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm flex items-center text-blue-600 hover:underline"
                  >
                    cTrader Open API Documentation <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">Saxo Bank</h4>
                <p className="mb-2">
                  Saxo Bank offers a comprehensive OpenAPI for trading multiple asset classes globally.
                </p>
                <div className="ml-4 mb-2">
                  <span className="font-semibold">Required:</span> App Key, Account Key, Access Token
                </div>
                <div className="ml-4 mb-4">
                  <a 
                    href="https://www.developer.saxo/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm flex items-center text-blue-600 hover:underline"
                  >
                    Saxo OpenAPI Documentation <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">TD Ameritrade / Schwab</h4>
                <p className="mb-2">
                  TD Ameritrade provides APIs for trading US equities, options, and more. Following the merger, this will transition to Schwab.
                </p>
                <div className="ml-4 mb-2">
                  <span className="font-semibold">Required:</span> Consumer Key, Refresh Token
                </div>
                <div className="ml-4 mb-4">
                  <a 
                    href="https://developer.tdameritrade.com/apis" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm flex items-center text-blue-600 hover:underline"
                  >
                    TD Ameritrade API Documentation <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="mb-4">
                <h4 className="text-md font-semibold mb-2">IG</h4>
                <p className="mb-2">
                  IG Markets offers a REST API for trading CFDs, forex, shares, and more.
                </p>
                <div className="ml-4 mb-2">
                  <span className="font-semibold">Required:</span> API Key, Username, Password
                </div>
                <div className="ml-4 mb-4">
                  <a 
                    href="https://labs.ig.com/rest-trading-api-reference" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm flex items-center text-blue-600 hover:underline"
                  >
                    IG REST API Documentation <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BrokerIntegrationDocs;