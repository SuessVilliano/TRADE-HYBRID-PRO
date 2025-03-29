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
      // Check if Vapi SDK is available in the global window object
      if (!(window as Window).VapiSDK) {
        console.error("Vapi SDK not available");
        toast.error("Vapi SDK not available. Please refresh the page and try again.");
        return;
      }
      
      // Initialize the Vapi SDK with the API key from environment variables
      const Vapi = (window as Window).VapiSDK;
      
      // Use our backend proxy to initialize Vapi with the API key
      // This way we don't expose our API key in the frontend
      const initResponse = await fetch('/api/vapi/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assistantId: selectedAgentId })
      });
      
      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(`Failed to initialize Vapi: ${errorData.error || initResponse.statusText}`);
      }
      
      const initData = await initResponse.json();
      
      // Create a new Vapi instance with the initialization data
      const vapi = new Vapi({
        assistantId: selectedAgentId,
        conversationId: initData.conversationId,
        // The API key is handled securely by our backend
      });
      
      console.log(`Starting call with agent ${selectedAgent.name} (ID: ${selectedAgentId})`);
      
      // Store the instance for later use
      setVapiInstance(vapi);
      
      // Start the call
      await vapi.start();
      
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
      // End call via the Vapi SDK if instance exists
      if (vapiInstance) {
        vapiInstance.stop();
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
      // Toggle mute status
      setIsMuted(!isMuted);
      
      // Update Vapi SDK if instance exists
      if (vapiInstance) {
        if (!isMuted) {
          vapiInstance.mute();
        } else {
          vapiInstance.unmute();
        }
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };
  
  const toggleSpeaker = () => {
    try {
      // Toggle speaker status
      setSpeakerEnabled(!speakerEnabled);
      
      // Update Vapi SDK if instance exists
      if (vapiInstance) {
        // Adjust volume (as a way to simulate speaker on/off)
        if (speakerEnabled) {
          vapiInstance.setVolume(0); // Mute the speaker
        } else {
          vapiInstance.setVolume(1); // Restore volume
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