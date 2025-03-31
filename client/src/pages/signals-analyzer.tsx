import { Helmet } from 'react-helmet-async';
import { PageHeading } from '../components/ui/page-heading';
import { SignalsAnalyzer } from '../components/ui/signals-analyzer';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import { PageLayout } from '../components/layout/page-layout';

export default function SignalsAnalyzerPage() {
  usePageTitle('Trade Signals Analyzer');

  return (
    <PageLayout>
      <Helmet>
        <title>Trade Signals Analyzer | TradeHybrid</title>
        <meta 
          name="description" 
          content="Analyze your trading signals against historical data to determine if stop loss or take profit was hit first." 
        />
      </Helmet>

      <PageHeading 
        title="Trade Signals Analyzer" 
        description="Upload historical market data and analyze your trading signals to determine if stop loss or take profit was hit first."
        className="mb-6"
      />

      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg bg-card">
              <SignalsAnalyzer />
            </div>
            
            <div className="p-6 rounded-lg border bg-card">
              <h2 className="text-xl font-semibold mb-4">How to Use the Trade Signals Analyzer</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">1. Upload Historical Data</h3>
                  <p className="text-muted-foreground">
                    Upload a CSV file containing historical price data for the asset you want to analyze. 
                    The CSV should include timestamp, open, high, low, close, and volume data.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">2. Select Signals to Analyze</h3>
                  <p className="text-muted-foreground">
                    Choose the asset and date range for the signals you want to analyze. The system will 
                    find all signals matching these criteria.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">3. Run Analysis</h3>
                  <p className="text-muted-foreground">
                    The system will analyze each signal against the historical data to determine if 
                    stop loss or take profit levels were hit first, and calculate the resulting P&L.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium">4. Export or Update Sheet</h3>
                  <p className="text-muted-foreground">
                    Export the analysis results to a CSV file or update your Google Sheet directly 
                    with the outcome of each trade signal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}