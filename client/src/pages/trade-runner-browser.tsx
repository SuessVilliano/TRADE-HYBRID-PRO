import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

// This component redirects users from the old Trade Runner Browser page to the new Trade Runner page
export default function TradeRunnerWebBrowserPage() {
  useEffect(() => {
    console.log("Redirecting from Trade Runner Browser to Trade Runner");
  }, []);

  return <Navigate to="/trade-runner" replace />;
}