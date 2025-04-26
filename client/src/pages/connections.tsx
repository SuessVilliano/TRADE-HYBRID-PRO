import { Helmet } from 'react-helmet-async';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import NexusStatusPanel from '@/components/trade/NexusStatusPanel';
import TradingViewConnector from '@/components/trade/TradingViewConnector';
import BrokerConnectionPanel from '@/components/trade/BrokerConnectionPanel';
import { SUPPORTED_BROKERS } from '@/lib/constants';

export default function ConnectionsPage() {
  return (
    <div className="container mx-auto p-4">
      <Helmet>
        <title>Connections | Trade Hybrid</title>
      </Helmet>
      
      <PageHeader
        title="Trading Connections"
        description="Manage your connections to brokers, trading platforms, and advanced trading services."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* TradingView Integration */}
        <div className="col-span-1">
          <TradingViewConnector />
        </div>

        {/* Nexus Status */}
        <div className="col-span-1">
          <NexusStatusPanel />
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Broker Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {/* Display major supported brokers */}
              {SUPPORTED_BROKERS
                .filter(broker => ['alpaca', 'oanda', 'ninjatrader', 'kraken', 'binance'].includes(broker.id))
                .map(broker => (
                  <BrokerConnectionPanel key={broker.id} brokerId={broker.id} />
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Connection Setup Guide</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <h3>Setting Up TradingView Alerts</h3>
            <p>
              TradingView alerts can be configured to send signals to your Trade Hybrid account.
              Here's how to set it up:
            </p>
            <ol>
              <li>Connect your TradingView account using the button above</li>
              <li>In TradingView, create a new alert</li>
              <li>Set your condition (price crossing, indicator value, etc.)</li>
              <li>In the "Alert actions" section, select "Webhook"</li>
              <li>Enter your webhook URL: <code>{window.location.origin}/api/webhooks/tradingview/YOUR_TOKEN</code></li>
              <li>For message format, use the following template:
                <pre>{`{
  "symbol": "{{ticker}}",
  "side": "buy", // or "sell"
  "price": {{close}},
  "quantity": 1, // adjust as needed
  "strategy": "My Strategy Name",
  "timeframe": "{{interval}}"
}`}</pre>
              </li>
              <li>Save your alert</li>
            </ol>

            <h3>Using Advanced Broker Aggregation (Nexus)</h3>
            <p>
              The Nexus system provides advanced trade execution by comparing prices and execution speeds
              across multiple brokers. To use Nexus:
            </p>
            <ol>
              <li>Connect at least two supported brokers (e.g., Alpaca and Oanda)</li>
              <li>Activate Nexus using the connection panel above</li>
              <li>When placing trades, select "Use Nexus" for optimal routing</li>
              <li>Nexus will automatically choose the best broker for your specific trade</li>
            </ol>

            <h3>Broker API Credentials</h3>
            <p>
              When connecting brokers, ensure you're using API keys with the appropriate permissions:
            </p>
            <ul>
              <li><strong>Alpaca:</strong> Requires trading permissions</li>
              <li><strong>Oanda:</strong> Requires account access and trading permissions</li>
              <li><strong>NinjaTrader:</strong> Requires a locally running NinjaTrader instance with the API enabled</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}