import React from 'react';
import { Helmet } from 'react-helmet-async';
import Game from '../components/game/Game';

/**
 * Metaverse trading environment page
 */
const MetaversePage: React.FC = () => {
  return (
    <div className="metaverse-page w-full h-screen">
      <Helmet>
        <title>Trade Hybrid - Metaverse Trading Environment</title>
      </Helmet>
      
      <div className="game-wrapper w-full h-full">
        <Game />
      </div>
    </div>
  );
};

export default MetaversePage;