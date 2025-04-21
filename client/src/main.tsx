import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './lib/hooks/useTheme';
import { MarketMoodProvider } from './lib/context/MarketMoodContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ThemeProvider defaultTheme="dark">
        <MarketMoodProvider>
          <App />
        </MarketMoodProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>,
);