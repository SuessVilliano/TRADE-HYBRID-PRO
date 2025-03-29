import { useState, useEffect, useRef } from "react";
import { useMultiplayer } from "../../lib/stores/useMultiplayer";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import { Mic, MicOff, Users, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";

interface VoiceChatControlsProps {
  className?: string;
  minimized?: boolean;
  onToggleMinimize?: () => void;
}

export function VoiceChatControls({ className, minimized = false, onToggleMinimize }: VoiceChatControlsProps) {
  const [expanded, setExpanded] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.8); // 0-1 scale
  const [speaking, setSpeaking] = useState(false);
  const mediaStream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const audioSources = useRef<Record<string, AudioBufferSourceNode>>({});
  const audioProcessor = useRef<ScriptProcessorNode | null>(null);
  
  const {
    voiceChatEnabled,
    toggleVoiceChat,
    sendVoiceData,
    activeSpeakers,
    players,
    clientId,
    isPlayerMuted
  } = useMultiplayer();
  
  // Setup voice chat
  useEffect(() => {
    if (voiceChatEnabled) {
      setupVoiceCapture();
      
      return () => {
        // Cleanup
        if (mediaStream.current) {
          mediaStream.current.getTracks().forEach(track => track.stop());
        }
        
        if (audioProcessor.current && audioContext.current) {
          audioProcessor.current.disconnect();
        }
        
        if (audioContext.current) {
          audioContext.current.close();
        }
      };
    }
  }, [voiceChatEnabled]);
  
  // Initialize audio capture
  const setupVoiceCapture = async () => {
    try {
      // First, initialize audio context to prevent browser issues
      // Some browsers need user interaction before creating AudioContext
      try {
        audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (contextError) {
        console.error("Error creating AudioContext:", contextError);
        toast.error("Could not initialize audio system. Try clicking somewhere on the page first.");
        return;
      }
      
      // Request microphone access
      try {
        mediaStream.current = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
          video: false,
        });
      } catch (micError) {
        console.error("Microphone access denied:", micError);
        toast.error("Microphone access denied. Voice chat disabled.");
        toggleVoiceChat(false);
        return;
      }
      
      // Create audio processor with safe fallbacks
      try {
        // Create audio processor to capture audio data
        audioProcessor.current = audioContext.current.createScriptProcessor(2048, 1, 1);
        
        // Create source from microphone stream
        const source = audioContext.current.createMediaStreamSource(mediaStream.current);
        source.connect(audioProcessor.current);
        audioProcessor.current.connect(audioContext.current.destination);
        
        // Process audio data
        audioProcessor.current.onaudioprocess = (event) => {
          // Only send when user is pressing the speak button or using push-to-talk
          if (speaking) {
            try {
              const inputBuffer = event.inputBuffer;
              const audioData = inputBuffer.getChannelData(0);
              
              // Check if sound is above threshold (not silent)
              // Calculate RMS (Root Mean Square) to detect if there's actual audio
              let rms = 0;
              for (let i = 0; i < audioData.length; i++) {
                rms += audioData[i] * audioData[i];
              }
              rms = Math.sqrt(rms / audioData.length);
              
              const isSilent = rms < 0.01; // Adjust this threshold as needed
              
              if (!isSilent && audioData && audioData.length > 0) {
                // Convert to 16-bit PCM for more efficient transmission
                const pcmData = convertFloatToPCM(audioData);
                
                // Send chunks to avoid large packets
                const CHUNK_SIZE = 1024; // Bytes per chunk
                for (let offset = 0; offset < pcmData.length; offset += CHUNK_SIZE / 2) { // Divide by 2 because each Int16 is 2 bytes
                  const chunkLength = Math.min(CHUNK_SIZE / 2, pcmData.length - offset);
                  const chunk = pcmData.subarray(offset, offset + chunkLength);
                  if (chunk && chunk.buffer) {
                    sendVoiceData(chunk.buffer);
                  }
                }
              }
            } catch (processError) {
              console.error("Audio processing error:", processError);
              // Don't show errors for every frame, just log it
            }
          }
        };
      } catch (processorError) {
        console.error("Error setting up audio processor:", processorError);
        toast.error("Could not initialize audio processing. Voice chat may not work correctly.");
      }
      
      toast.success("Voice chat enabled");
    } catch (error) {
      console.error("Error setting up voice chat:", error);
      toast.error("Failed to access microphone. Voice chat disabled.");
      toggleVoiceChat(false);
    }
  };
  
  // Convert float32 audio data to Int16 PCM format
  const convertFloatToPCM = (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      // Convert -1 to 1 range to -32768 to 32767 range
      int16Array[i] = Math.max(-32768, Math.min(32767, float32Array[i] * 32767));
    }
    return int16Array;
  };
  
  // Handle push-to-talk
  const handlePushToTalk = (isActive: boolean) => {
    setSpeaking(isActive);
  };
  
  // Toggle voice chat on/off
  const handleToggleVoiceChat = () => {
    toggleVoiceChat(!voiceChatEnabled);
    if (voiceChatEnabled) {
      // Clean up when turning off
      if (mediaStream.current) {
        mediaStream.current.getTracks().forEach(track => track.stop());
        mediaStream.current = null;
      }
    }
  };
  
  // Get active speakers with names
  const activeSpeakersWithNames = activeSpeakers
    .filter(id => !isPlayerMuted(id)) // Filter out muted players
    .map(id => {
      const player = players.find(p => p.id === id);
      return player ? { id, username: player.username } : null;
    })
    .filter(Boolean);
    
  return (
    <div 
      className={cn(
        "bg-black/70 text-white rounded-lg overflow-hidden transition-all duration-300",
        minimized ? "w-60 h-10" : "w-80",
        expanded && !minimized ? "w-96" : "",
        className
      )}
    >
      {/* Header */}
      <div 
        className="bg-gray-800 px-3 py-2 flex justify-between items-center cursor-pointer"
        onClick={onToggleMinimize}
      >
        <div className="flex items-center gap-2">
          {voiceChatEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          <span className="text-md font-semibold">Voice Chat</span>
          {voiceChatEnabled && (
            <span className="text-xs bg-green-700 rounded-full px-2 py-0.5">
              On
            </span>
          )}
          {!voiceChatEnabled && (
            <span className="text-xs bg-red-700 rounded-full px-2 py-0.5">
              Off
            </span>
          )}
        </div>
        
        {!minimized && (
          <div className="flex items-center space-x-1">
            <button 
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
              className="text-gray-400 hover:text-gray-200"
            >
              {expanded ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleMinimize?.(); }}
              className="text-gray-400 hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
      
      {/* Content - only visible when not minimized */}
      {!minimized && (
        <div className="p-3">
          {/* Voice controls */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant={voiceChatEnabled ? "destructive" : "default"}
                size="sm"
                onClick={handleToggleVoiceChat}
              >
                {voiceChatEnabled ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Enable
                  </>
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              {masterVolume === 0 ? (
                <VolumeX className="h-4 w-4 text-gray-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-gray-400" />
              )}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          {/* Push-to-talk button (only visible when voice chat is enabled) */}
          {voiceChatEnabled && (
            <div className="bg-gray-800/50 rounded-lg p-3 text-center">
              <button
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-2 transition-all",
                  speaking ? "bg-green-600 scale-110" : "bg-gray-700 hover:bg-gray-600"
                )}
                onMouseDown={(e) => { e.preventDefault(); handlePushToTalk(true); }}
                onMouseUp={(e) => { e.preventDefault(); handlePushToTalk(false); }}
                onMouseLeave={(e) => { e.preventDefault(); handlePushToTalk(false); }}
                onTouchStart={(e) => { e.preventDefault(); handlePushToTalk(true); }}
                onTouchEnd={(e) => { e.preventDefault(); handlePushToTalk(false); }}
              >
                <Mic className={cn("h-6 w-6", speaking ? "animate-pulse" : "")} />
              </button>
              <p className="text-sm text-gray-400">
                Press and hold to speak
              </p>
            </div>
          )}
          
          {/* Active speakers */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-medium">Active Speakers</h3>
            </div>
            
            <div className="bg-gray-800/30 rounded-lg p-2">
              {activeSpeakersWithNames.length > 0 ? (
                <div className="space-y-2">
                  {activeSpeakersWithNames.map((speaker) => (
                    <div key={speaker?.id} className="flex items-center justify-between p-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center animate-pulse">
                          <Mic className="h-3 w-3" />
                        </div>
                        <span className="text-sm">{speaker?.username}</span>
                      </div>
                      <div className="flex space-x-1">
                        {/* Animated sound waves */}
                        <div className="flex items-center space-x-0.5">
                          <div className="w-1 h-3 bg-green-500 rounded-full animate-soundwave"></div>
                          <div className="w-1 h-5 bg-green-500 rounded-full animate-soundwave-2"></div>
                          <div className="w-1 h-4 bg-green-500 rounded-full animate-soundwave-3"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-sm text-gray-400">
                  No one is speaking
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

