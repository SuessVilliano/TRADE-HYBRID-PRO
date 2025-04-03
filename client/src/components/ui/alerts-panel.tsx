import React, { useState } from 'react';
import { Bell, Plus, X, Trash2 } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Switch } from './switch';
import { Label } from './label';

interface AlertsPanelProps {
  symbol: string;
  className?: string;
}

interface Alert {
  id: string;
  symbol: string;
  price: number;
  condition: 'above' | 'below';
  triggered: boolean;
  active: boolean;
}

export function AlertsPanel({ symbol, className }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<Alert[]>([
    { id: '1', symbol: 'BTCUSDT', price: 30000, condition: 'above', triggered: false, active: true },
    { id: '2', symbol: 'BTCUSDT', price: 28500, condition: 'below', triggered: false, active: true },
    { id: '3', symbol: 'ETHUSDT', price: 3800, condition: 'above', triggered: true, active: false },
  ]);
  
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  const [isCreating, setIsCreating] = useState(false);
  
  const handleToggleAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, active: !alert.active } : alert
    ));
  };
  
  const handleDeleteAlert = (alertId: string) => {
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };
  
  const handleAddAlert = () => {
    if (!newAlertPrice || isNaN(parseFloat(newAlertPrice))) return;
    
    const newAlert: Alert = {
      id: Date.now().toString(),
      symbol: symbol,
      price: parseFloat(newAlertPrice),
      condition: newAlertCondition,
      triggered: false,
      active: true
    };
    
    setAlerts([...alerts, newAlert]);
    setNewAlertPrice('');
    setIsCreating(false);
  };
  
  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-4 w-4 text-blue-500 mr-2" />
            <div className="font-medium">Price Alerts</div>
          </div>
          <Button 
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsCreating(!isCreating)}
          >
            {isCreating ? (
              <X className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      {isCreating && (
        <div className="p-3 border-b border-slate-700 bg-slate-800/80">
          <div className="text-sm font-medium mb-2">New Alert</div>
          <div className="flex flex-col space-y-3">
            <div>
              <Label className="text-xs">Symbol</Label>
              <div className="text-sm font-medium">{symbol}</div>
            </div>
            
            <div>
              <Label className="text-xs">Alert me when price is</Label>
              <div className="flex space-x-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs px-3 py-1 h-7 ${newAlertCondition === 'above' ? 'bg-slate-700' : ''}`}
                  onClick={() => setNewAlertCondition('above')}
                >
                  Above
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs px-3 py-1 h-7 ${newAlertCondition === 'below' ? 'bg-slate-700' : ''}`}
                  onClick={() => setNewAlertCondition('below')}
                >
                  Below
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="alert-price" className="text-xs">Price</Label>
              <Input
                id="alert-price"
                type="number"
                placeholder="0.00"
                value={newAlertPrice}
                onChange={(e) => setNewAlertPrice(e.target.value)}
                className="h-8 mt-1"
              />
            </div>
            
            <div className="flex space-x-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleAddAlert}
              >
                Create Alert
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        {alerts.length > 0 ? (
          <div className="divide-y divide-slate-700">
            {alerts.map(alert => (
              <div 
                key={alert.id} 
                className={`p-3 ${alert.triggered ? 'bg-red-900/20' : ''}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">{alert.symbol}</div>
                    <div className="flex items-center mt-1">
                      <span 
                        className={`text-xs ${
                          alert.condition === 'above' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {alert.condition === 'above' ? '↑' : '↓'}
                      </span>
                      <span className="text-sm ml-1">
                        ${alert.price.toLocaleString(undefined, {
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {alert.triggered ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400">
                        Triggered
                      </span>
                    ) : (
                      <Switch
                        checked={alert.active}
                        onCheckedChange={() => handleToggleAlert(alert.id)}
                        className="h-5 w-10 scale-75 origin-left"
                      />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-red-400"
                      onClick={() => handleDeleteAlert(alert.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4">
            <Bell className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-center">No price alerts set</p>
            <p className="text-xs text-center mt-1">Create an alert to get notified when price targets are reached</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setIsCreating(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}