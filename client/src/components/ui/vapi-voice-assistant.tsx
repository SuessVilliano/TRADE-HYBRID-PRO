import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface VapiVoiceAssistantProps {
  className?: string;
}

// Define available agents
const agents = [
  {
    id: 'fab154aa-9707-40b6-ac7e-ac50c7ddc1ff',
    name: 'Customer Support CC',
    description: 'Handles customer inquiries and general platform support',
    avatar: 'CC'
  },
  {
    id: '25a51f2c-0973-496f-95f5-3a4ce921e3c5',
    name: 'Member Support',
    description: 'Specialized agent for membership and account questions',
    avatar: 'MS'
  },
  {
    id: 'd0043466-7dc5-4912-8771-63acd9417426',
    name: 'Welcome Agent',
    description: 'Helps new users onboard and get started with the platform',
    avatar: 'WA'
  },
  {
    id: '4b872f64-cf5b-4004-b3ce-10c5f6a32ac0',
    name: 'Trade Recap Agent',
    description: 'Assists traders with analyzing their trades and performance',
    avatar: 'TR'
  }
];

export function VapiVoiceAssistant({ className }: VapiVoiceAssistantProps) {
  // State for call
  const [isCallActive, setIsCallActive] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0].id);
  const [isDurationWarningShown, setIsDurationWarningShown] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(agents[0]);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isVapiSDKLoaded, setIsVapiSDKLoaded] = useState(false);
  const [isLoadingSDK, setIsLoadingSDK] = useState(false);
  
  // Load Vapi SDK
  useEffect(() => {
    const loadVapiSDK = () => {
      if ((window as any).VapiSDK || isLoadingSDK) return;
      
      console.log('Starting Vapi SDK loading process');
      setIsLoadingSDK(true);
      
      // Try to remove old script if exists to avoid conflicts
      const oldScript = document.getElementById('vapi-sdk-script');
      if (oldScript) {
        console.log('Removing old Vapi script');
        oldScript.remove();
      }
      
      // Add script to page with a unique ID
      const script = document.createElement('script');
      script.id = 'vapi-sdk-script';
      script.src = 'https://cdn.vapi.ai/web-sdk@latest/browser/index.browser.js';
      script.async = true;
      script.onload = () => {
        console.log('Vapi SDK loaded successfully');
        // Small delay to ensure the SDK is fully initialized
        setTimeout(() => {
          setIsVapiSDKLoaded(true);
          setIsLoadingSDK(false);
        }, 500);
      };
      script.onerror = (error) => {
        console.error('Failed to load Vapi SDK', error);
        toast.error('Failed to load voice assistant. Please refresh the page and try again.');
        setIsLoadingSDK(false);
      };
      
      document.body.appendChild(script);
    };
    
    loadVapiSDK();
    
    // Cleanup
    return () => {
      const script = document.getElementById('vapi-sdk-script');
      if (script) {
        console.log('Cleaning up Vapi SDK script');
        script.remove();
      }
    };
  }, []);
  
  // Find the selected agent in the agents array
  useEffect(() => {
    const agent = agents.find(a => a.id === selectedAgentId);
    if (agent) {
      setSelectedAgent(agent);
    }
  }, [selectedAgentId]);
  
  // Call duration timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => {
          // Show warning at 4:45 (285 seconds)
          if (prev === 285 && !isDurationWarningShown) {
            setIsDurationWarningShown(true);
            toast.warning("Your call will end in 15 seconds. Need more time? End and restart the call.");
          }
          
          // Auto-end call at 5:00 (300 seconds)
          if (prev >= 300) {
            endCall();
            return 0;
          }
          
          return prev + 1;
        });
      }, 1000);
    } else {
      setCallDuration(0);
      setIsDurationWarningShown(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCallActive, isDurationWarningShown]);
  
  // Format time as MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Define VapiSDK type for TypeScript
  interface Window {
    VapiSDK?: any;
  }

  // Reference to store Vapi instance
  const [vapiInstance, setVapiInstance] = useState<any>(null);

  const startCall = async () => {
    try {
      console.log("Starting Vapi call initialization");
      
      // Check if SDK is loaded properly
      if (!isVapiSDKLoaded) {
        console.error("Vapi SDK not loaded yet");
        toast.error("Voice assistant is still loading. Please wait a moment and try again.");
        return;
      }
      
      // Check if the window object has the expected SDK properties
      if (!(window as any).vapi) {
        console.error("Vapi SDK object not found in window", window);
        toast.error("Voice assistant SDK not properly initialized. Please refresh the page.");
        return;
      }
      
      // Log SDK version for debugging
      console.log("Vapi SDK version:", (window as any).vapi?.version || "unknown");
      
      // Use our backend proxy to initialize Vapi with the API key
      console.log("Initializing Vapi conversation with API");
      const initResponse = await fetch('/api/vapi/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assistantId: selectedAgentId })
      });
      
      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        console.error("Failed to initialize Vapi:", errorData);
        throw new Error(`Failed to initialize Vapi: ${errorData.error || initResponse.statusText}`);
      }
      
      const initData = await initResponse.json();
      console.log("Vapi initialization successful:", initData);
      
      // Use the latest SDK initialization pattern
      const vapiClient = new (window as any).vapi.VapiClient({
        apiKey: 'proxy', // This is a placeholder as we use backend proxy
        assistantId: selectedAgentId,
        stream: true,
        conversationId: initData.conversationId || undefined,
      });
      
      console.log(`Creating Vapi instance for agent ${selectedAgent.name} (ID: ${selectedAgentId})`);
      
      // Store the instance for later use
      setVapiInstance(vapiClient);
      
      // Start the call
      console.log("Starting Vapi call");
      await vapiClient.start();
      
      // Update UI
      setIsCallActive(true);
      toast.success(`Connected to ${selectedAgent.name}`);
      
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to connect to voice assistant. Please try again.");
    }
  };
  
  const endCall = () => {
    try {
      console.log("Ending Vapi call");
      
      // End call via the Vapi SDK if instance exists
      if (vapiInstance) {
        try {
          vapiInstance.stop();
        } catch (err) {
          console.error("Error stopping Vapi client:", err);
        }
        setVapiInstance(null);
      }
      
      // Update UI
      setIsCallActive(false);
      toast.info(`Call with ${selectedAgent.name} ended`);
    } catch (error) {
      console.error("Error ending call:", error);
      setIsCallActive(false);
    }
  };
  
  const toggleMute = () => {
    try {
      // Toggle mute status first for immediate UI feedback
      setIsMuted(!isMuted);
      
      // Update Vapi SDK if instance exists
      if (vapiInstance) {
        console.log("Toggling microphone mute state:", !isMuted ? "muted" : "unmuted");
        
        if (!isMuted) {
          // Currently unmuted, so mute it
          try {
            vapiInstance.mute?.() || vapiInstance.toggleMute?.(true);
          } catch (err) {
            console.error("Error muting:", err);
          }
        } else {
          // Currently muted, so unmute it
          try {
            vapiInstance.unmute?.() || vapiInstance.toggleMute?.(false);
          } catch (err) {
            console.error("Error unmuting:", err);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };
  
  const toggleSpeaker = () => {
    try {
      // Toggle speaker status first for immediate UI feedback
      setSpeakerEnabled(!speakerEnabled);
      
      // Update Vapi SDK if instance exists
      if (vapiInstance) {
        console.log("Toggling speaker state:", !speakerEnabled ? "on" : "off");
        
        // Adjust volume (as a way to simulate speaker on/off)
        try {
          if (speakerEnabled) {
            // Currently on, turn it off
            vapiInstance.setVolume?.(0) || vapiInstance.toggleSpeaker?.(false);
          } else {
            // Currently off, turn it on
            vapiInstance.setVolume?.(1) || vapiInstance.toggleSpeaker?.(true);
          }
        } catch (err) {
          console.error("Error toggling speaker:", err);
        }
      }
    } catch (error) {
      console.error("Error toggling speaker:", error);
    }
  };

  return (
    <Card className={cn("w-full overflow-hidden", className)}>
      <CardHeader className="bg-slate-800 border-b pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Voice Assistant</CardTitle>
            <CardDescription>Talk with an AI voice agent for assistance</CardDescription>
          </div>
          {isCallActive && (
            <Badge variant="outline" className="font-mono text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {formatTime(callDuration)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-4">
          {/* Agent selection dropdown */}
          <div className="space-y-1.5">
            <Label htmlFor="agent">Select Assistant</Label>
            <Select
              value={selectedAgentId}
              onValueChange={setSelectedAgentId}
              disabled={isCallActive}
            >
              <SelectTrigger id="agent" className="w-full">
                <SelectValue placeholder="Select an agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Available Agents</SelectLabel>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Agent details */}
          <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-lg border border-slate-700">
            <Avatar className="h-12 w-12 border-2 border-indigo-500">
              <AvatarFallback className="bg-indigo-800 text-white font-bold">
                {selectedAgent.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{selectedAgent.name}</h3>
              <p className="text-xs text-slate-400">{selectedAgent.description}</p>
            </div>
          </div>
          
          {/* Call controls */}
          <div className="flex flex-col gap-3">
            {isCallActive ? (
              <>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "flex flex-col items-center py-4",
                      isMuted ? "bg-slate-800" : ""
                    )}
                    onClick={toggleMute}
                  >
                    {isMuted ? (
                      <MicOff className="h-5 w-5 mb-1" />
                    ) : (
                      <Mic className="h-5 w-5 mb-1" />
                    )}
                    <span className="text-xs">{isMuted ? "Unmute" : "Mute"}</span>
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="lg"
                    className="flex flex-col items-center py-4"
                    onClick={endCall}
                  >
                    <PhoneOff className="h-5 w-5 mb-1" />
                    <span className="text-xs">End Call</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "flex flex-col items-center py-4",
                      !speakerEnabled ? "bg-slate-800" : ""
                    )}
                    onClick={toggleSpeaker}
                  >
                    {speakerEnabled ? (
                      <Volume2 className="h-5 w-5 mb-1" />
                    ) : (
                      <VolumeX className="h-5 w-5 mb-1" />
                    )}
                    <span className="text-xs">Speaker</span>
                  </Button>
                </div>
                
                <div className="p-3 border border-yellow-500/20 bg-yellow-500/10 rounded-lg text-xs">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <p>
                      Your call will automatically end after 5 minutes. You can end
                      the current call and start a new one if you need more time.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <Button 
                size="lg"
                className="py-6 text-base flex items-center gap-2"
                onClick={startCall}
              >
                <Phone className="h-5 w-5" />
                Call {selectedAgent.name}
              </Button>
            )}
          </div>
          
          <Separator />
          
          {/* Usage tips */}
          <div>
            <h4 className="font-medium mb-2 text-sm">Quick Tips</h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>• Speak clearly and pause between sentences</li>
              <li>• Ask specific questions for better assistance</li>
              <li>• For Trade Recap agent, have your trade details ready</li>
              <li>• For Member Support, have your account ID available</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}