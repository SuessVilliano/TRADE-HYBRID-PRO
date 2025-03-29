import React, { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { ScrollArea } from './scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { useFeatureDisclosure, UserExperienceLevel } from '@/lib/context/FeatureDisclosureProvider';

// Types for compliance features
export interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  category: 'kyc' | 'trading' | 'security' | 'data' | 'terms';
  requiredLevel: UserExperienceLevel;
}

// Compliance requirements by category
export const complianceRequirements: ComplianceRequirement[] = [
  {
    id: 'kyc_basic',
    title: 'Basic Identity Verification',
    description: 'Provide your name, email address, and country of residence to use basic platform features.',
    category: 'kyc',
    requiredLevel: UserExperienceLevel.BEGINNER
  },
  {
    id: 'kyc_advanced',
    title: 'Advanced Identity Verification',
    description: 'Government ID verification required for advanced trading features and higher transaction limits.',
    category: 'kyc',
    requiredLevel: UserExperienceLevel.ADVANCED
  },
  {
    id: 'trading_limits',
    title: 'Trading Limits',
    description: 'Daily and monthly limits apply to all trading activities based on your verification level.',
    category: 'trading',
    requiredLevel: UserExperienceLevel.BEGINNER
  },
  {
    id: 'trading_restricted',
    title: 'Restricted Trading Instruments',
    description: "Access to certain trading instruments may be restricted based on your region's regulations.",
    category: 'trading',
    requiredLevel: UserExperienceLevel.INTERMEDIATE
  },
  {
    id: 'security_2fa',
    title: 'Two-Factor Authentication',
    description: 'Enable 2FA for enhanced account security (required for transactions above certain thresholds).',
    category: 'security',
    requiredLevel: UserExperienceLevel.BEGINNER
  },
  {
    id: 'data_privacy',
    title: 'Data Privacy Controls',
    description: 'Controls for managing how your data is used, stored, and shared within the platform.',
    category: 'data',
    requiredLevel: UserExperienceLevel.BEGINNER
  },
  {
    id: 'terms_agreement',
    title: 'Terms of Service',
    description: 'Acceptance of platform terms of service is required to use Trade Hybrid.',
    category: 'terms',
    requiredLevel: UserExperienceLevel.BEGINNER
  }
];

// Jurisdictions and region-specific regulations
export interface JurisdictionInfo {
  id: string;
  name: string;
  allowedFeatures: string[];
  restrictedFeatures: string[];
  regulatoryNotes: string;
}

export const jurisdictions: JurisdictionInfo[] = [
  {
    id: 'us',
    name: 'United States',
    allowedFeatures: ['Basic Trading', 'Educational Content', 'Market Analysis'],
    restrictedFeatures: ['Leveraged Trading', 'Certain Cryptocurrencies'],
    regulatoryNotes: 'U.S. users are subject to SEC, CFTC, and state regulations. Not all cryptocurrencies are available.'
  },
  {
    id: 'eu',
    name: 'European Union',
    allowedFeatures: ['Full Trading Suite', 'Educational Content', 'Market Analysis'],
    restrictedFeatures: ['Unregulated Assets'],
    regulatoryNotes: 'EU users are subject to MiFID II and regional cryptocurrency regulations.'
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    allowedFeatures: ['Full Trading Suite', 'Educational Content', 'Market Analysis'],
    restrictedFeatures: ['Certain Derivatives'],
    regulatoryNotes: 'UK users are subject to FCA regulations for financial services.'
  },
  {
    id: 'asia',
    name: 'Asia Pacific',
    allowedFeatures: ['Full Trading Suite', 'Educational Content', 'Market Analysis'],
    restrictedFeatures: ['Varies by Country'],
    regulatoryNotes: 'Regulations vary significantly by country. Check local laws.'
  },
  {
    id: 'other',
    name: 'Other Regions',
    allowedFeatures: ['Basic Trading', 'Educational Content'],
    restrictedFeatures: ['Varies by Country'],
    regulatoryNotes: 'Access to features may be limited based on local regulations.'
  }
];

// Compliance status check component
interface ComplianceStatusProps {
  onCheckCompleted: (isCompliant: boolean) => void;
}

export function ComplianceStatus({ onCheckCompleted }: ComplianceStatusProps) {
  const { userLevel } = useFeatureDisclosure();
  const [completedItems, setCompletedItems] = useState<string[]>([]);
  const [region, setRegion] = useState<string>('');
  
  // Get required compliance items for user's experience level
  const requiredItems = complianceRequirements.filter(
    item => Object.values(UserExperienceLevel).indexOf(item.requiredLevel) <= 
            Object.values(UserExperienceLevel).indexOf(userLevel)
  );
  
  const isCompliant = requiredItems.every(item => completedItems.includes(item.id));
  
  // Effect to notify parent when compliance status changes
  useEffect(() => {
    onCheckCompleted(isCompliant);
  }, [isCompliant, onCheckCompleted]);
  
  const toggleComplianceItem = (id: string) => {
    setCompletedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id) 
        : [...prev, id]
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Compliance Status</h3>
          <div className={`px-2 py-1 rounded text-xs ${isCompliant ? 'bg-green-900 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
            {isCompliant ? 'Compliant' : 'Action Required'}
          </div>
        </div>
        <p className="text-sm text-slate-400">
          {isCompliant 
            ? 'Your account meets all current compliance requirements.'
            : `${completedItems.length} of ${requiredItems.length} requirements completed.`
          }
        </p>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Select Your Region:</label>
        <select 
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm"
        >
          <option value="">Select Region</option>
          {jurisdictions.map(j => (
            <option key={j.id} value={j.id}>{j.name}</option>
          ))}
        </select>
      </div>
      
      {region && (
        <div className="bg-slate-900 rounded-lg p-4 mb-4">
          <h4 className="font-medium mb-2">Regional Compliance Information</h4>
          <div className="text-sm text-slate-400 space-y-2">
            {jurisdictions.find(j => j.id === region)?.regulatoryNotes}
            
            <div>
              <span className="font-medium text-green-400">Allowed Features: </span>
              {jurisdictions.find(j => j.id === region)?.allowedFeatures.join(', ')}
            </div>
            
            <div>
              <span className="font-medium text-orange-400">Restricted Features: </span>
              {jurisdictions.find(j => j.id === region)?.restrictedFeatures.join(', ')}
            </div>
          </div>
        </div>
      )}
      
      <div className="space-y-1">
        {requiredItems.map((item) => (
          <div key={item.id} className="flex items-start gap-2 p-2 rounded-md hover:bg-slate-900">
            <div 
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer ${
                completedItems.includes(item.id) 
                  ? 'bg-green-600 text-green-50' 
                  : 'bg-slate-700 text-slate-300'
              }`}
              onClick={() => toggleComplianceItem(item.id)}
            >
              {completedItems.includes(item.id) && <CheckCircle className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-medium text-sm">{item.title}</div>
              <div className="text-xs text-slate-400">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main compliance modal
interface RegulatoryComplianceProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegulatoryCompliance({ isOpen, onClose }: RegulatoryComplianceProps) {
  const [activeTab, setActiveTab] = useState('status');
  const [isCompliant, setIsCompliant] = useState(false);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-purple-400" />
            Regulatory Compliance Center
          </DialogTitle>
          <DialogDescription>
            Manage compliance requirements and verify your account status
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="status">Compliance Status</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="regions">Regional Information</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="h-[400px] pr-4">
            <TabsContent value="status">
              <ComplianceStatus onCheckCompleted={setIsCompliant} />
            </TabsContent>
            
            <TabsContent value="requirements">
              <Accordion type="single" collapsible className="w-full">
                {['kyc', 'trading', 'security', 'data', 'terms'].map(category => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-base font-medium">
                      {category.charAt(0).toUpperCase() + category.slice(1)} Requirements
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pl-2">
                        {complianceRequirements
                          .filter(item => item.category === category)
                          .map(req => (
                            <div key={req.id} className="border-l-2 border-slate-700 pl-3 py-1">
                              <h3 className="font-medium">{req.title}</h3>
                              <p className="text-sm text-slate-400">{req.description}</p>
                              <div className="text-xs text-purple-400 mt-1">
                                Required for: {req.requiredLevel} level and above
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>
            
            <TabsContent value="regions">
              <div className="space-y-6">
                {jurisdictions.map(j => (
                  <div key={j.id} className="bg-slate-900 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">{j.name}</h3>
                    <p className="text-sm text-slate-400 mb-3">{j.regulatoryNotes}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-slate-800 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-green-400 mb-2">Allowed Features</h4>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {j.allowedFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-500" /> {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-slate-800 p-3 rounded-md">
                        <h4 className="text-sm font-medium text-orange-400 mb-2">Restricted Features</h4>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {j.restrictedFeatures.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <X className="w-3 h-3 mr-2 text-orange-500" /> {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-sm text-slate-400">
                  <p>For more detailed regulatory information, please consult with a legal professional familiar with your local regulations.</p>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        <DialogFooter>
          <div className="flex justify-between w-full items-center">
            <a 
              href="/terms-of-service" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-purple-400 hover:underline flex items-center"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Full Terms of Service
            </a>
            
            <Button onClick={onClose} className="ml-auto">
              {isCompliant ? 'Continue to Platform' : 'Continue Setup'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Compliance notice banner for specific features
interface ComplianceNoticeBannerProps {
  feature: string;
  description: string;
  requirements: string[];
}

export function ComplianceNoticeBanner({ feature, description, requirements }: ComplianceNoticeBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-800/50 rounded-lg p-3 mb-4 relative">
      <button 
        className="absolute top-2 right-2 text-slate-400 hover:text-white" 
        onClick={() => setIsVisible(false)}
      >
        <X className="w-4 h-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-medium mb-1">{feature} Compliance Notice</h3>
          <p className="text-sm text-slate-300 mb-2">{description}</p>
          
          {requirements.length > 0 && (
            <div className="bg-black/30 rounded p-2 mb-2">
              <span className="text-xs font-medium text-slate-300 block mb-1">Requirements:</span>
              <ul className="text-xs text-slate-400 space-y-1 pl-4 list-disc">
                {requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="secondary" className="text-xs h-7 px-2">
              Complete Requirements
            </Button>
            <Button size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => setIsVisible(false)}>
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check if a feature is compliant
export function useComplianceCheck(featureId: string) {
  const [isCompliant, setIsCompliant] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  
  // In a real application, you would check actual compliance status
  // For this example, we'll always return true
  
  return {
    isCompliant,
    showComplianceDialog: () => setShowDialog(true),
    hideComplianceDialog: () => setShowDialog(false),
    ComplianceDialog: () => (
      <RegulatoryCompliance 
        isOpen={showDialog} 
        onClose={() => setShowDialog(false)} 
      />
    )
  };
}