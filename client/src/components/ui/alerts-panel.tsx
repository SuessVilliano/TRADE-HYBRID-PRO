import React, { useState } from 'react';
import { Button } from './button';
import { Plus, X } from 'lucide-react';

interface AlertsPanelProps {
  symbol: string;
  className?: string;
}

export function AlertsPanel({ symbol, className }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState([
    { id: 1, symbol: 'BTCUSDT', condition: 'above', price: 29000, active: true },
    { id: 2, symbol: 'ETHUSDT', condition: 'below', price: 1600, active: true },
  ]);
  
  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-3 border-b border-slate-700 flex justify-between items-center">
        <div className="font-medium">Price Alerts</div>
        <Button variant="outline" size="sm" className="h-8 text-xs">
          <Plus className="h-3 w-3 mr-1" />
          New Alert
        </Button>
      </div>
      
      <div className="flex-grow p-2 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            No price alerts set
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-700/50 border border-slate-600 rounded-md p-3 flex justify-between items-start"
              >
                <div>
                  <div className="flex items-center">
                    <div className="font-medium">{alert.symbol}</div>
                    <div className={`text-xs ml-2 px-1.5 py-0.5 rounded ${
                      alert.active ? 'bg-green-900/50 text-green-400' : 'bg-slate-600 text-slate-300'
                    }`}>
                      {alert.active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="text-sm mt-1">
                    Trigger when price goes{' '}
                    <span className={alert.condition === 'above' ? 'text-green-500' : 'text-red-500'}>
                      {alert.condition}
                    </span>{' '}
                    ${alert.price.toLocaleString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-white hover:bg-red-900/70"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}