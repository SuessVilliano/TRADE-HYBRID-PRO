import { Request, Response } from "express";
import * as crypto from "crypto";

// Generate a deterministic but random list of game players for the leaderboard
function generateGameLeaderboard(seed: string, count: number, gameId: string) {
  const players = [];
  
  // First names list for username generation
  const firstNames = [
    "Alpha", "Beta", "Crypto", "Delta", "Echo", "Forex", "Gold", "Hedge", "Invest",
    "Jade", "Kilo", "Lunar", "Market", "Nasdaq", "Omega", "Profit", "Quant", "Risk",
    "Stock", "Trade", "Ultra", "Value", "Wealth", "Yield", "Zero"
  ];
  
  // Last names/suffixes list for username generation
  const lastNames = [
    "Trader", "Master", "Guru", "Pro", "Expert", "Ninja", "Whale", "Hunter", "King",
    "Queen", "Baron", "Shark", "Eagle", "Tiger", "Wizard", "Samurai", "Titan", "Legend",
    "Sage", "Phoenix", "Wolf", "Hawk", "Bear", "Bull"
  ];
  
  for (let i = 0; i < count; i++) {
    // Create a deterministic seed for this player
    const playerSeed = crypto.createHash('md5').update(`${seed}-${gameId}-${i}`).digest('hex');
    
    // Generate a username
    const firstNameIndex = parseInt(playerSeed.substring(0, 2), 16) % firstNames.length;
    const lastNameIndex = parseInt(playerSeed.substring(2, 4), 16) % lastNames.length;
    const username = `${firstNames[firstNameIndex]}${lastNames[lastNameIndex]}`;
    
    // Generate score numbers
    const scoreBase = parseInt(playerSeed.substring(4, 10), 16);
    const levelBase = parseInt(playerSeed.substring(10, 12), 16);
    const timeBase = parseInt(playerSeed.substring(12, 16), 16);
    
    // Make score decrease as we go down the list, but with some variance
    let maxScore = 0;
    let levelRange = [0, 0];
    let timeRange = [0, 0];

    // Adjust values based on game type
    if (gameId === 'trade-runner') {
      maxScore = 25000;
      levelRange = [1, 20];
      timeRange = [30, 300]; // in seconds
    } else if (gameId === 'candlestick-challenge') {
      maxScore = 100;
      levelRange = [1, 10];
      timeRange = [60, 600]; // in seconds
    } else {
      maxScore = 10000;
      levelRange = [1, 15];
      timeRange = [60, 480]; // in seconds
    }

    const scoreVariance = (Math.random() * 2000) - 1000;
    const score = Math.max(100, maxScore - (i * (maxScore/count)) + scoreVariance);
    
    // Level and completion time with some randomness
    const level = Math.min(levelRange[1], Math.max(levelRange[0], (levelBase % levelRange[1]) + levelRange[0]));
    const completionTime = timeRange[0] + (timeBase % (timeRange[1] - timeRange[0]));
    
    players.push({
      id: playerSeed.substring(0, 8),
      username,
      avatar: "", // No avatar data for now
      score: Math.round(score),
      level,
      completionTime,
      date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    });
  }
  
  // Sort by score (descending)
  players.sort((a, b) => b.score - a.score);
  
  return players;
}

// Get game leaderboard data
export const getGameLeaderboard = (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string || '20');
    const validCount = Math.min(Math.max(5, count), 100); // Limit between 5 and 100
    const gameId = req.params.gameId || 'trade-runner';
    
    // Create a seed based on the current week to keep leaderboard stable for a week
    const date = new Date();
    const weekNumber = Math.floor(date.getDate() / 7);
    const weekSeed = `${date.getFullYear()}-${date.getMonth()}-${weekNumber}`;
    const seed = crypto.createHash('md5').update(weekSeed).digest('hex');
    
    // Generate leaderboard data
    const players = generateGameLeaderboard(seed, validCount, gameId);
    
    res.json({
      gameId,
      leaderboard: players,
      updated: new Date().toISOString()
    });
  } catch (error) {
    console.error(`Error generating ${req.params.gameId} leaderboard:`, error);
    res.status(500).json({ error: "Failed to generate game leaderboard" });
  }
};

// Get specific player data
export const getGamePlayer = (req: Request, res: Response) => {
  try {
    const playerId = req.params.playerId;
    const gameId = req.params.gameId || 'trade-runner';
    
    // Create a seed based on the current week
    const date = new Date();
    const weekNumber = Math.floor(date.getDate() / 7);
    const weekSeed = `${date.getFullYear()}-${date.getMonth()}-${weekNumber}`;
    const seed = crypto.createHash('md5').update(weekSeed).digest('hex');
    
    // Generate all players (so we can find the specific one)
    const allPlayers = generateGameLeaderboard(seed, 100, gameId);
    
    // Find the requested player
    const player = allPlayers.find(p => p.id === playerId);
    
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }
    
    // Add additional player details
    const playerSeed = crypto.createHash('md5').update(`${seed}-detail-${playerId}`).digest('hex');
    
    // Generate some additional game-specific stats
    let additionalStats = {};
    
    if (gameId === 'trade-runner') {
      additionalStats = {
        coinsCollected: Math.round(player.score / 10),
        obstaclesAvoided: Math.round(player.score / 100),
        powerupsUsed: Math.floor(Math.random() * 10),
        distanceTraveled: Math.round(player.score / 5)
      };
    } else if (gameId === 'candlestick-challenge') {
      additionalStats = {
        correctPatterns: Math.round(player.score),
        streakBest: Math.floor(player.score / 10),
        accuracy: Math.min(100, Math.round(player.score + Math.random() * 20)),
        timeBonus: Math.round(player.score / 2)
      };
    } else {
      additionalStats = {
        totalScore: player.score,
        bonusPoints: Math.round(player.score * 0.2),
        timeMultiplier: parseFloat((1 + Math.random()).toFixed(1))
      };
    }
    
    const detailedPlayer = {
      ...player,
      ...additionalStats,
      rank: allPlayers.findIndex(p => p.id === playerId) + 1,
      gamesPlayed: 10 + Math.floor(Math.random() * 20),
      joinDate: new Date(Date.now() - (parseInt(playerSeed.substring(0, 8), 16) % 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
    
    res.json(detailedPlayer);
  } catch (error) {
    console.error(`Error getting ${req.params.gameId} player:`, error);
    res.status(500).json({ error: "Failed to get game player" });
  }
};

// Submit a new score
export const submitGameScore = (req: Request, res: Response) => {
  try {
    const { score, level, completionTime } = req.body;
    const gameId = req.params.gameId || 'trade-runner';
    
    // Basic validation
    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: "Invalid score value" });
    }
    
    // In a real implementation, we would save this score to a database
    // For now, just return a success response
    res.json({
      success: true,
      message: "Score submitted successfully",
      scoreInfo: {
        gameId,
        score,
        level: level || 1,
        completionTime: completionTime || 0,
        date: new Date().toISOString(),
        // In a real implementation, this would be the player's actual rank
        provisionalRank: Math.floor(Math.random() * 20) + 1
      }
    });
  } catch (error) {
    console.error(`Error submitting ${req.params.gameId} score:`, error);
    res.status(500).json({ error: "Failed to submit game score" });
  }
};