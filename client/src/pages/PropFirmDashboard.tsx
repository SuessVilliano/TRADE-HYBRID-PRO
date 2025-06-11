import React from 'react';

const PropFirmDashboardPage: React.FC = () => {
  return (
    <div className="h-screen w-full">
      <iframe
        src="https://hybridfundingdashboard.propaccount.com/en/signin"
        className="w-full h-full border-0"
        title="HybridFunding Dashboard"
        allow="fullscreen"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
      />
    </div>
  );
};

export default PropFirmDashboardPage;