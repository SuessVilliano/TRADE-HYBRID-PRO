import React, { useState, useRef, useEffect } from 'react';
import { X, Maximize2, Minimize2, Move } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Switch } from './switch';
import { toast } from '../../lib/toastify-bridge';

interface FloatingTradePanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

export function FloatingTradePanel({
  isOpen,
  onClose,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 450, height: 600 },
}: FloatingTradePanelProps) {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState({
    position: initialPosition,
    size: initialSize,
  });
  const [activeTab, setActiveTab] = useState('market');
  const [selectedBroker, setSelectedBroker] = useState('alpaca');
  const [orderType, setOrderType] = useState('market');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [leverage, setLeverage] = useState('1');
  const [availableBrokers, setAvailableBrokers] = useState([
    { id: 'alpaca', name: 'Alpaca' },
    { id: 'abatev', name: 'ABATEV Protocol' },
    { id: 'td-ameritrade', name: 'TD Ameritrade' },
    { id: 'interactive-brokers', name: 'Interactive Brokers' },
    { id: 'tradestation', name: 'TradeStation' },
  ]);

  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  // Handle panel dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMaximized]);

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && !isMaximized) {
        const newWidth = Math.max(300, e.clientX - position.x);
        const newHeight = Math.max(400, e.clientY - position.y);
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, position, isMaximized]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (headerRef.current && !isMaximized) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isMaximized) {
      setIsResizing(true);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore previous state
      setPosition(preMaximizeState.position);
      setSize(preMaximizeState.size);
    } else {
      // Save current state and maximize
      setPreMaximizeState({
        position,
        size,
      });
      
      // Using window dimensions for full screen
      setPosition({ x: 0, y: 0 });
      setSize({ 
        width: window.innerWidth, 
        height: window.innerHeight - 50 // Account for possible navbar
      });
    }
    setIsMaximized(!isMaximized);
  };

  const handleSubmitOrder = () => {
    if (!selectedSymbol || !quantity) {
      toast.error('Symbol and quantity are required');
      return;
    }

    const orderData = {
      symbol: selectedSymbol,
      quantity: parseFloat(quantity),
      type: orderType,
      side: activeTab === 'buy' ? 'buy' : 'sell',
      ...(orderType !== 'market' && price && { price: parseFloat(price) }),
      ...(orderType === 'stop' && stopPrice && { stopPrice: parseFloat(stopPrice) }),
      broker: selectedBroker,
      leverage: parseFloat(leverage)
    };

    console.log('Submitting order:', orderData);
    toast.success(`Order submitted: ${orderData.side.toUpperCase()} ${orderData.quantity} ${orderData.symbol}`);
    
    // Here you would make the API call to place the trade with the selected broker
    // Example: apiService.placeOrder(orderData);
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(e.target.value.toUpperCase());
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className="fixed z-50 shadow-xl rounded-lg overflow-hidden bg-card border"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease'
      }}
    >
      <div 
        ref={headerRef}
        className="bg-muted px-4 py-2 cursor-move flex items-center justify-between"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4" />
          <h3 className="text-sm font-medium">Trade Panel</h3>
        </div>
        <div className="flex items-center gap-1">
          {isMaximized ? (
            <Button variant="ghost" size="icon" onClick={toggleMaximize}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={toggleMaximize}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 40px)' }}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="broker-select">Broker</Label>
            <Select value={selectedBroker} onValueChange={setSelectedBroker}>
              <SelectTrigger id="broker-select" className="w-[180px]">
                <SelectValue placeholder="Select broker" />
              </SelectTrigger>
              <SelectContent>
                {availableBrokers.map(broker => (
                  <SelectItem key={broker.id} value={broker.id}>
                    {broker.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input 
                id="symbol" 
                placeholder="e.g. AAPL" 
                value={selectedSymbol} 
                onChange={handleSymbolChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input 
                id="quantity" 
                type="number" 
                min="0" 
                placeholder="Quantity" 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="buy" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Buy</TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Sell</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="order-type">Order Type</Label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger id="order-type">
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
                  <SelectItem value="stop">Stop</SelectItem>
                  <SelectItem value="stop-limit">Stop Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType !== 'market' && (
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input 
                  id="price" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="Limit Price" 
                  value={price} 
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            )}

            {(orderType === 'stop' || orderType === 'stop-limit') && (
              <div className="space-y-2">
                <Label htmlFor="stop-price">Stop Price</Label>
                <Input 
                  id="stop-price" 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  placeholder="Stop Price" 
                  value={stopPrice} 
                  onChange={(e) => setStopPrice(e.target.value)}
                />
              </div>
            )}

            {selectedBroker === 'abatev' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="leverage">Leverage</Label>
                    <span className="text-sm">{leverage}x</span>
                  </div>
                  <Input 
                    id="leverage" 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="1" 
                    value={leverage} 
                    onChange={(e) => setLeverage(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="reduce-only" />
                  <Label htmlFor="reduce-only">Reduce Only</Label>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <Button 
              onClick={handleSubmitOrder}
              className={`w-full ${activeTab === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {activeTab === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
            </Button>
          </div>

          <div className="border rounded p-3 mt-4">
            <h4 className="text-xs font-semibold mb-2">Order Summary</h4>
            <div className="grid grid-cols-2 gap-y-1 text-xs">
              <span className="text-muted-foreground">Type:</span>
              <span className="capitalize">{orderType}</span>
              
              <span className="text-muted-foreground">Side:</span>
              <span className="capitalize">{activeTab}</span>
              
              <span className="text-muted-foreground">Symbol:</span>
              <span>{selectedSymbol || '—'}</span>
              
              <span className="text-muted-foreground">Quantity:</span>
              <span>{quantity || '—'}</span>
              
              {orderType !== 'market' && (
                <>
                  <span className="text-muted-foreground">Price:</span>
                  <span>{price ? `$${price}` : '—'}</span>
                </>
              )}
              
              {(orderType === 'stop' || orderType === 'stop-limit') && (
                <>
                  <span className="text-muted-foreground">Stop Price:</span>
                  <span>{stopPrice ? `$${stopPrice}` : '—'}</span>
                </>
              )}
              
              <span className="text-muted-foreground">Broker:</span>
              <span className="capitalize">{selectedBroker.replace('-', ' ')}</span>
              
              {selectedBroker === 'abatev' && (
                <>
                  <span className="text-muted-foreground">Leverage:</span>
                  <span>{leverage}x</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Resize handle */}
      <div 
        ref={resizerRef}
        className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize ${isMaximized ? 'hidden' : ''}`}
        onMouseDown={handleResizeStart}
      >
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 10 10" 
          className="absolute bottom-1 right-1"
        >
          <path 
            d="M0 10L10 10L10 0" 
            fill="none" 
            stroke="currentColor" 
            strokeOpacity="0.3" 
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}