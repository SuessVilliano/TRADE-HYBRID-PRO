// Spatial SDK configuration
export const SPATIAL_CONFIG = {
  // Default Spatial space URL
  defaultSpaceUrl: 'https://www.spatial.io/s/tradehybrids-Hi-Fi-Meetup-67ead44037f57e72f6fcaed5?share=93452074553144377',
  
  // SDK settings
  sdkVersion: '1.0.0',
  
  // Areas in our metaverse
  areas: {
    reception: {
      name: 'Reception & Welcome Area',
      description: 'Modern welcome area with virtual receptionist and digital welcome board',
      position: { x: 0, y: 0, z: 0 },
      interactiveElements: ['welcomeBoard', 'receptionist']
    },
    tradingFloor: {
      name: 'Trading Floor',
      description: 'Main trading area with multiple desks and real-time market data',
      position: { x: 10, y: 0, z: 0 },
      interactiveElements: ['tradingDesk', 'marketDisplay', 'aiAssistant']
    },
    hybridHoldings: {
      name: 'Hybrid Holdings Private Trading Room',
      description: 'Exclusive access area for elite traders with live market tracker',
      position: { x: -10, y: 0, z: 10 },
      interactiveElements: ['marketTracker', 'portfolioDisplay']
    },
    streamingStudio: {
      name: 'Streaming & Podcast Studio',
      description: 'Professional setup for live trade analysis and interviews',
      position: { x: 0, y: 0, z: 20 },
      interactiveElements: ['streamingSetup', 'aiCoHost', 'bookingSystem']
    },
    merchStore: {
      name: 'Merch & Tools Store',
      description: 'Virtual shop for Trade Hybrid merchandise and trading tools',
      position: { x: 20, y: 0, z: 0 },
      interactiveElements: ['productShelf', 'checkoutSystem']
    },
    eventSpace: {
      name: 'Event Space & Education Room',
      description: 'Area for live workshops and training sessions',
      position: { x: 20, y: 0, z: 20 },
      interactiveElements: ['auditorium', 'digitalWhiteboard', 'aiTutor']
    }
  },
  
  // Interactive elements that can be placed in the metaverse
  interactiveElements: {
    welcomeBoard: {
      name: 'Digital Welcome Board',
      description: 'Displays company information and services',
      onInteract: 'showCompanyInfo'
    },
    receptionist: {
      name: 'Virtual Receptionist',
      description: 'AI-powered guide for visitors',
      onInteract: 'startConversation'
    },
    tradingDesk: {
      name: 'Trading Desk',
      description: 'Workstation with multiple monitors',
      onInteract: 'openTradingDashboard'
    },
    marketDisplay: {
      name: 'Market Data Display',
      description: 'Real-time market data visualization',
      onInteract: 'showMarketData'
    },
    aiAssistant: {
      name: 'AI Trading Assistant',
      description: 'Voice-activated AI for market insights',
      onInteract: 'activateAssistant'
    },
    marketTracker: {
      name: 'Live Market Tracker',
      description: 'Giant LED wall showing market movements',
      onInteract: 'displayMarketTracker'
    },
    portfolioDisplay: {
      name: 'Portfolio Display',
      description: 'Shows top-performing portfolios',
      onInteract: 'showPortfolios'
    },
    streamingSetup: {
      name: 'Streaming Setup',
      description: 'Professional equipment for live streams',
      onInteract: 'startStreaming'
    },
    aiCoHost: {
      name: 'AI Co-Host',
      description: 'AI that reads live market news',
      onInteract: 'activateCoHost'
    },
    bookingSystem: {
      name: 'Recording Booking System',
      description: 'System to book recording sessions',
      onInteract: 'openBookingCalendar'
    },
    productShelf: {
      name: 'Digital Product Shelf',
      description: 'Displays merchandise and trading tools',
      onInteract: 'browseProducts'
    },
    checkoutSystem: {
      name: 'Instant Checkout',
      description: 'Quick purchase system',
      onInteract: 'processCheckout'
    },
    auditorium: {
      name: 'Training Auditorium',
      description: '50-seat venue for workshops',
      onInteract: 'joinEvent'
    },
    digitalWhiteboard: {
      name: 'Digital Whiteboard',
      description: 'Interactive board for presentations',
      onInteract: 'useWhiteboard'
    },
    aiTutor: {
      name: 'AI Tutor',
      description: 'AI chatbot for educational support',
      onInteract: 'askQuestion'
    }
  }
};

// Helper functions to interact with Spatial spaces
export const getSpatialAreaByName = (areaName: string) => {
  const areas = SPATIAL_CONFIG.areas;
  return areas[areaName as keyof typeof areas] || null;
};

export const getInteractiveElement = (elementId: string) => {
  const elements = SPATIAL_CONFIG.interactiveElements;
  return elements[elementId as keyof typeof elements] || null;
};