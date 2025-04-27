# Trade Hybrid Frontend

The Trade Hybrid Frontend provides the user interface for the Trade Hybrid platform, a cutting-edge decentralized trading platform that leverages blockchain technology and AI-driven market insights.

## Features

- Responsive design for desktop, tablet, and mobile
- Wallet connection (Phantom, Web3Auth)
- Trading signals display with filtering options
- Broker integration interfaces via Nexus
- THC token staking interfaces
- User profile management
- Matrix contract visualization
- Trade Hybrid TV (TH TV) livestream viewing
- Real-time price tracking from BirdEye and Raydium

## Tech Stack

- React with TypeScript
- Tailwind CSS for styling
- @react-three/fiber and @react-three/drei for 3D visualizations
- @solana/wallet-adapter for wallet connections
- Web3Auth integration
- HLS.js for livestream viewing
- Framer Motion for animations
- Zustand for state management
- React Router for routing
- Axios for API requests

## Setup Instructions

### Prerequisites

- Node.js 18 or higher
- NPM or Yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/tradehybrid.git
   cd tradehybrid/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment configuration:
   ```bash
   cp .env.example .env.local
   ```
   
4. Edit the environment variables:
   ```
   VITE_API_URL=https://api.tradehybrid.club
   VITE_NEXUS_URL=https://nexus.tradehybrid.club
   VITE_STAKING_URL=https://stake.tradehybrid.club
   VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   VITE_THC_TOKEN_ADDRESS=4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4
   VITE_VALIDATOR_PUBLIC_KEY=5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   ```

### Docker Deployment

To deploy using Docker:

```bash
docker build -t tradehybrid-frontend .
docker run -p 80:80 -p 443:443 tradehybrid-frontend
```

## Project Structure

```
frontend/
├── public/             # Static assets
│   ├── fonts/          # Custom fonts
│   ├── images/         # Images and icons
│   └── videos/         # Video assets
├── src/
│   ├── assets/         # Bundled assets
│   ├── components/     # React components
│   │   ├── auth/       # Authentication components
│   │   ├── broker/     # Broker integration components
│   │   ├── charts/     # Chart components
│   │   ├── common/     # Common UI components
│   │   ├── layout/     # Layout components
│   │   ├── profile/    # User profile components
│   │   ├── signals/    # Trading signals components
│   │   ├── staking/    # Staking components
│   │   ├── tv/         # TH TV components
│   │   └── wallet/     # Wallet components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   │   ├── api/        # API client
│   │   ├── contexts/   # React contexts
│   │   ├── services/   # Service modules
│   │   └── utils/      # Utility functions
│   ├── pages/          # Page components
│   ├── routes/         # Routing configuration
│   ├── store/          # Global state management
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main App component
│   ├── main.tsx        # Entry point
│   └── vite-env.d.ts   # Vite type declarations
├── .env.example        # Example environment variables
├── index.html          # HTML template
├── package.json        # Project dependencies
├── postcss.config.js   # PostCSS configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## Key Components

### Wallet Integration

The platform supports multiple wallet connections:

```tsx
// EnhancedWalletConnect.tsx
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { Web3AuthProvider } from '../providers/Web3AuthProvider';

export const EnhancedWalletConnect = () => {
  const { connected } = useWallet();
  
  return (
    <div className="wallet-connect-container">
      <WalletMultiButton />
      {!connected && <Web3AuthProvider />}
    </div>
  );
};
```

### Trading Signals

Trading signals are displayed with filtering options:

```tsx
// TradingSignals.tsx
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { SignalCard } from './SignalCard';

export const TradingSignals = () => {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    api.getSignals(filter).then(data => setSignals(data));
  }, [filter]);
  
  return (
    <div className="signals-container">
      <div className="filter-controls">
        {/* Filter controls */}
      </div>
      <div className="signals-grid">
        {signals.map(signal => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
};
```

### TH TV Component

The TH TV component for livestream viewing:

```tsx
// THLivestream.tsx
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export const THLivestream = ({ streamUrl }) => {
  const videoRef = useRef(null);
  
  useEffect(() => {
    if (Hls.isSupported() && videoRef.current) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(videoRef.current);
    }
  }, [streamUrl]);
  
  return (
    <div className="livestream-container">
      <video ref={videoRef} controls autoPlay />
    </div>
  );
};
```

## Building for Production

To build the application for production:

1. Update the environment variables for production
2. Run the build command:
   ```bash
   npm run build
   ```
3. The build output will be in the `dist` directory

## Deployment

The frontend can be deployed using:

1. **Nginx**: Copy the `dist` directory to your web server
2. **Docker**: Use the provided Dockerfile
3. **Hetzner EX101**: Follow the migration guide in `docs/migration-guide.md`

## Development Guidelines

- Follow the component structure in the project
- Use TypeScript for all new code
- Maintain consistent styling with Tailwind CSS
- Write unit tests for critical components
- Follow the Git workflow in the contributing guide

## Support

For frontend-related support, contact:
- Email: frontend@tradehybrid.club
- Discord: #frontend-support