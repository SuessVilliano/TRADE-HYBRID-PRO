import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, RefreshCw, Check, X, Key, ShieldAlert, ExternalLink } from 'lucide-react';
import { SUPPORTED_BROKERS } from '@/lib/constants';

// Mock secret storage - in a real app, would use secure storage
const SECRET_STORAGE_KEY = 'trade-hybrid-api-keys';

interface ApiKeyManagerProps {
  onValidStatusChange?: (isValid: boolean) => void;
  defaultBroker?: string;
  className?: string;
}

export function ApiKeyManager({ 
  onValidStatusChange, 
  defaultBroker,
  className = ''
}: ApiKeyManagerProps) {
  const { toast } = useToast();
  const [selectedBroker, setSelectedBroker] = useState(defaultBroker || '');
  const [apiKeys, setApiKeys] = useState<Record<string, Record<string, string>>>({});
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<Record<string, boolean>>({});
  const [testMode, setTestMode] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [brokerToDelete, setBrokerToDelete] = useState('');
  
  // Load saved API keys from storage
  useEffect(() => {
    const savedKeys = localStorage.getItem(SECRET_STORAGE_KEY);
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        setApiKeys(parsedKeys);
        
        // Notify parent component if any keys are saved
        if (onValidStatusChange) {
          const hasAnyKeys = Object.keys(parsedKeys).length > 0;
          onValidStatusChange(hasAnyKeys);
        }
      } catch (error) {
        console.error('Failed to parse saved API keys:', error);
      }
    }
  }, [onValidStatusChange]);
  
  // Handler for broker selection
  const handleBrokerChange = (brokerId: string) => {
    setSelectedBroker(brokerId);
  };
  
  // Get fields for selected broker
  const getFieldsForBroker = () => {
    const broker = SUPPORTED_BROKERS.find(b => b.id === selectedBroker);
    return broker?.apiKeyFields || [];
  };
  
  // Toggle password visibility
  const togglePasswordVisibility = (fieldId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };
  
  // Handle input change
  const handleInputChange = (fieldId: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [selectedBroker]: {
        ...prev[selectedBroker],
        [fieldId]: value
      }
    }));
  };
  
  // Save API keys
  const saveApiKeys = () => {
    if (!selectedBroker) {
      toast({
        title: "No broker selected",
        description: "Please select a broker before saving API keys.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate that all required fields are filled
    const fields = getFieldsForBroker();
    const brokerKeys = apiKeys[selectedBroker] || {};
    
    const missingFields = fields.filter(field => !brokerKeys[field.id]);
    if (missingFields.length > 0) {
      toast({
        title: "Missing fields",
        description: `Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    // Save to local storage
    localStorage.setItem(SECRET_STORAGE_KEY, JSON.stringify(apiKeys));
    
    // Validate keys
    validateApiKeys();
    
    toast({
      title: "API keys saved",
      description: `Your API keys for ${getSelectedBrokerName()} have been saved.`
    });
    
    // Notify parent component
    if (onValidStatusChange) {
      onValidStatusChange(true);
    }
  };
  
  // Delete API keys
  const deleteApiKeys = (brokerId: string) => {
    setBrokerToDelete(brokerId);
    setShowDeleteConfirm(true);
  };
  
  // Confirm deletion
  const confirmDelete = () => {
    if (!brokerToDelete) return;
    
    const newApiKeys = { ...apiKeys };
    delete newApiKeys[brokerToDelete];
    
    setApiKeys(newApiKeys);
    localStorage.setItem(SECRET_STORAGE_KEY, JSON.stringify(newApiKeys));
    
    // Update validation status
    const newValidationStatus = { ...validationStatus };
    delete newValidationStatus[brokerToDelete];
    setValidationStatus(newValidationStatus);
    
    // Notify parent if no keys left
    if (onValidStatusChange && Object.keys(newApiKeys).length === 0) {
      onValidStatusChange(false);
    }
    
    setShowDeleteConfirm(false);
    setBrokerToDelete('');
    
    toast({
      title: "API keys deleted",
      description: `Your API keys for ${SUPPORTED_BROKERS.find(b => b.id === brokerToDelete)?.name || brokerToDelete} have been removed.`
    });
  };
  
  // Validate API keys
  const validateApiKeys = () => {
    if (!selectedBroker || !apiKeys[selectedBroker]) {
      toast({
        title: "No API keys found",
        description: "Please save API keys first before validating.",
        variant: "destructive"
      });
      return;
    }
    
    setIsValidating(true);
    
    // Simulate API validation (would be a real API call in production)
    setTimeout(() => {
      // 80% chance of success for demo purposes
      const isValid = Math.random() > 0.2;
      
      setValidationStatus(prev => ({
        ...prev,
        [selectedBroker]: isValid
      }));
      
      setIsValidating(false);
      
      if (isValid) {
        toast({
          title: "API keys valid",
          description: `Your API keys for ${getSelectedBrokerName()} have been validated successfully.`
        });
      } else {
        toast({
          title: "API keys invalid",
          description: `Your API keys for ${getSelectedBrokerName()} could not be validated. Please check and try again.`,
          variant: "destructive"
        });
      }
      
      // Notify parent component
      if (onValidStatusChange) {
        onValidStatusChange(isValid);
      }
    }, 1500);
  };
  
  // Get the name of the selected broker
  const getSelectedBrokerName = () => {
    return SUPPORTED_BROKERS.find(b => b.id === selectedBroker)?.name || selectedBroker;
  };
  
  // Get saved brokers with keys
  const getSavedBrokers = () => {
    return Object.keys(apiKeys).filter(key => 
      apiKeys[key] && Object.values(apiKeys[key]).some(val => val)
    );
  };
  
  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Manager
          </CardTitle>
          <CardDescription>
            Manage your API keys for connecting to trading platforms and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="add">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="add">Add Keys</TabsTrigger>
              <TabsTrigger value="saved">Saved Keys</TabsTrigger>
            </TabsList>
            
            <TabsContent value="add" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="broker-select">Select Broker</Label>
                  <Select 
                    value={selectedBroker} 
                    onValueChange={handleBrokerChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a broker" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_BROKERS.map(broker => (
                        <SelectItem key={broker.id} value={broker.id}>
                          <div className="flex items-center">
                            <span>{broker.name}</span>
                            {broker.isBrokerAggregator && (
                              <Badge className="ml-2" variant="secondary">Aggregator</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedBroker && (
                  <div className="space-y-2 border p-3 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{getSelectedBrokerName()} API Keys</h4>
                      
                      {validationStatus[selectedBroker] !== undefined && (
                        <Badge variant={validationStatus[selectedBroker] ? "success" : "destructive"}>
                          {validationStatus[selectedBroker] ? "Valid" : "Invalid"}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {getFieldsForBroker().map(field => (
                        <div key={field.id} className="space-y-1">
                          <Label htmlFor={`${selectedBroker}-${field.id}`}>{field.label}</Label>
                          <div className="relative">
                            <Input
                              id={`${selectedBroker}-${field.id}`}
                              type={field.type === 'password' && !showPassword[field.id] ? 'password' : 'text'}
                              placeholder={`Enter ${field.label.toLowerCase()}`}
                              value={apiKeys[selectedBroker]?.[field.id] || ''}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                            />
                            {field.type === 'password' && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => togglePasswordVisibility(field.id)}
                              >
                                {showPassword[field.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center pt-2">
                      <div className="flex-1 text-xs text-muted-foreground">
                        {testMode ? 'Using test environment' : 'Using production environment'}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTestMode(!testMode)}
                      >
                        {testMode ? 'Switch to Prod' : 'Switch to Test'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {selectedBroker && (
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertTitle>Security Notice</AlertTitle>
                  <AlertDescription>
                    Your API keys are stored securely on your device. Create read-only API keys when possible 
                    and never share your keys with anyone.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
            
            <TabsContent value="saved" className="space-y-4">
              {getSavedBrokers().length > 0 ? (
                <div className="space-y-3">
                  {getSavedBrokers().map(brokerId => {
                    const broker = SUPPORTED_BROKERS.find(b => b.id === brokerId);
                    return (
                      <div key={brokerId} className="border rounded-md p-3">
                        <div className="flex justify-between items-center">
                          <div className="font-medium flex items-center">
                            <span>{broker?.name || brokerId}</span>
                            {validationStatus[brokerId] !== undefined && (
                              <Badge 
                                variant={validationStatus[brokerId] ? "success" : "destructive"}
                                className="ml-2"
                              >
                                {validationStatus[brokerId] ? "Valid" : "Invalid"}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedBroker(brokerId);
                                validateApiKeys();
                              }}
                            >
                              <RefreshCw className="h-4 w-4 mr-1" />
                              Validate
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => deleteApiKeys(brokerId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {broker?.description || 'Trading platform'}
                        </div>
                        <div className="mt-2 text-xs">
                          {broker?.apiKeyFields?.map(field => (
                            <div key={field.id} className="flex">
                              <span className="font-medium w-24">{field.label}:</span>
                              <span>
                                {field.type === 'password' 
                                  ? '••••••••••••••••' 
                                  : (apiKeys[brokerId]?.[field.id] || 'Not set')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center p-4 border rounded-md text-muted-foreground">
                  <p>No API keys saved yet.</p>
                  <p className="text-sm mt-1">Add your first API key in the "Add Keys" tab.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          {selectedBroker && SUPPORTED_BROKERS.find(b => b.id === selectedBroker)?.url && (
            <Button 
              variant="outline" 
              asChild
            >
              <a 
                href={SUPPORTED_BROKERS.find(b => b.id === selectedBroker)?.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                Get API Keys
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Button>
          )}
          
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              disabled={!selectedBroker || isValidating}
              onClick={validateApiKeys}
            >
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>Test Connection</>
              )}
            </Button>
            
            <Button
              disabled={!selectedBroker}
              onClick={saveApiKeys}
            >
              <Check className="h-4 w-4 mr-2" />
              Save Keys
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the API keys for {SUPPORTED_BROKERS.find(b => b.id === brokerToDelete)?.name || brokerToDelete}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}