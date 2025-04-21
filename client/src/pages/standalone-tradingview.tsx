// Standalone TradingView page without any dependencies
const StandaloneTradingView = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe 
        src="https://www.tradingview.com/chart/GtJVbpFg/" 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="TradingView Chart"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen
      />
    </div>
  );
};

export default StandaloneTradingView;