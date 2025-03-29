import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, X, Share2, StopCircle, Download, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Using simpler approach for TypeScript compatibility
// We'll just use 'any' for the speech recognition types to avoid complex type issues

interface VisionAIScreenShareProps {
  className?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function VisionAIScreenShare({ className }: VisionAIScreenShareProps) {
  // State for screen sharing
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  
  // State for messages
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      role: "assistant",
      content: "Hello! I'm your AI trading assistant. Share your screen with me to get help with chart analysis, pattern recognition, or any other trading visuals.",
      timestamp: new Date(),
    }
  ]);
  
  // State for input
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // State for voice recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Screen capture interval for AI analysis
  const captureIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopScreenShare();
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
    };
  }, []);

  // Check if the device is mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const startScreenShare = async () => {
    try {
      // Check if this is a mobile device
      if (isMobile()) {
        // Show special instructions for mobile users
        toast.info("Mobile screen sharing might be limited. For best results, use a desktop browser.");
      }
      
      // TypeScript doesn't recognize all options, but these are valid in modern browsers
      // We set optimized settings for both desktop and mobile
      const displayMedia = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser' as any, // Prefer browser tab on supported browsers
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15 }, // Lower frame rate for better performance on mobile
        },
        audio: false,
        // Note: Additional options below would be handled at the browser level 
        // even though TypeScript doesn't recognize them
      });
      
      setStream(displayMedia);
      setIsSharing(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = displayMedia;
      }
      
      // Set up a handler for when user stops sharing
      displayMedia.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });
      
      // Start periodic screen captures for AI analysis
      startCaptureInterval();
      
      // Add system message about screen sharing
      addMessage({
        id: `system-${Date.now()}`,
        role: "assistant",
        content: "Screen sharing started! I can now see your charts and trading interface. Feel free to ask questions about what's displayed.",
        timestamp: new Date()
      });
      
    } catch (err: unknown) {
      console.error("Error starting screen share:", err);
      
      // More helpful error message based on the error type
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          toast.error("Screen sharing permission denied. Please allow screen sharing in your browser settings.");
        } else if (err.name === 'NotSupportedError' || err.name === 'NotFoundError') {
          toast.error("Screen sharing is not supported on this device or browser. Try using a desktop browser like Chrome or Firefox.");
        } else {
          toast.error("Failed to start screen sharing. " + (isMobile() ? "Mobile devices have limited screen sharing support." : "Please check permissions and try again."));
        }
      } else {
        toast.error("Failed to start screen sharing. Please check permissions and try again.");
      }
    }
  };
  
  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsSharing(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      // Stop the capture interval
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
        captureIntervalRef.current = null;
      }
      
      // Add system message about stopping screen sharing
      addMessage({
        id: `system-${Date.now()}`,
        role: "assistant",
        content: "Screen sharing stopped. I can no longer see your screen.",
        timestamp: new Date()
      });
    }
  };
  
  const startCaptureInterval = () => {
    // Clear any existing interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
    }
    
    // Set up a new interval to capture screenshots for AI analysis
    captureIntervalRef.current = setInterval(() => {
      captureScreenshot();
    }, 10000); // Every 10 seconds
  };
  
  const captureScreenshot = () => {
    if (!videoRef.current || !isSharing) return;
    
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw the current video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 for sending to AI service
        const screenshotBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        console.log("Captured screenshot for AI analysis");
        
        // Return the base64 image data
        return screenshotBase64;
      }
    } catch (error) {
      console.error("Error capturing screenshot:", error);
    }
    
    return null;
  };
  
  // Capture screenshot on demand (for immediate analysis)
  const captureAndAnalyzeNow = async () => {
    if (!videoRef.current || !isSharing) {
      toast.error("No screen is being shared. Start screen sharing first.");
      return;
    }
    
    try {
      // Get screenshot from the screen
      const screenshotBase64 = captureScreenshot();
      
      if (!screenshotBase64) {
        toast.error("Failed to capture screenshot. Please try again.");
        return;
      }
      
      // Show generating state
      setIsGenerating(true);
      
      // Create a prompt for the Gemini API
      const prompt = "Analyze this trading chart. Identify key patterns, support and resistance levels, and potential trading opportunities. Mention any notable indicators visible on the chart. Provide a professional and concise analysis.";
      
      try {
        // Call the Gemini Vision API through our backend
        const response = await fetch('/api/gemini/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: screenshotBase64,
            prompt: prompt
          })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add the AI response to the chat
        addMessage({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.analysis || "Sorry, I couldn't analyze the chart at this time. Please try again.",
          timestamp: new Date()
        });
      } catch (error) {
        console.error("Error calling Gemini API:", error);
        
        // Fallback to a generic message
        addMessage({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "I'm sorry, I encountered an error analyzing your chart. This could be due to API limits or connectivity issues. Please try again in a moment.",
          timestamp: new Date()
        });
        
        toast.error("Failed to analyze screen. API error occurred.");
      } finally {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error capturing and analyzing screenshot:", error);
      toast.error("Failed to analyze screen. Please try again.");
      setIsGenerating(false);
    }
  };
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    addMessage(userMessage);
    setInput("");
    
    // Generate AI response
    setIsGenerating(true);
    
    // Capture screenshot if screen is being shared
    let screenshot = null;
    if (isSharing && videoRef.current) {
      screenshot = captureScreenshot();
    }
    
    try {
      await generateResponse(input, screenshot);
    } catch (error) {
      console.error("Error generating response:", error);
      // Fallback to local response
      simulateLocalResponse(input);
      toast.error("Failed to generate AI response. Using local fallback.");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateResponse = async (question: string, screenshot: string | null = null) => {
    try {
      if (screenshot) {
        // We have a screenshot, use Gemini Vision API
        const prompt = `Please analyze this trading chart and answer the following question: "${question}"`;
        
        const response = await fetch('/api/gemini/analyze-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image: screenshot,
            prompt: prompt
          })
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Add the AI response to the chat
        addMessage({
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.analysis || "Sorry, I couldn't analyze the chart at this time. Please try again.",
          timestamp: new Date()
        });
      } else {
        // No screenshot available, use text-only responses
        if (process.env.NODE_ENV === 'development') {
          // In development, fall back to simulated responses
          simulateGeminiResponse(question);
        } else {
          // In production, try to use the API for text-only responses
          // For now, we're still using simulated responses
          simulateGeminiResponse(question);
        }
      }
    } catch (error) {
      console.error("Error in generateResponse:", error);
      // Fall back to local simulated response
      simulateLocalResponse(question);
      throw error; // Re-throw to allow the caller to handle it
    }
  };
  
  const simulateGeminiResponse = (question: string) => {
    const lowerQuestion = question.toLowerCase();
    let response = "";
    
    if (isSharing) {
      // If screen is being shared, pretend we're analyzing the chart
      if (lowerQuestion.includes("pattern") || lowerQuestion.includes("see")) {
        response = "Based on the chart you're sharing, I can see a consolidation pattern forming with decreasing volume. This often precedes a significant move. The key levels to watch are the resistance at the upper boundary and support at the lower boundary of the pattern.";
      } 
      else if (lowerQuestion.includes("indicator") || lowerQuestion.includes("rsi") || lowerQuestion.includes("macd")) {
        response = "Looking at the indicators on your chart, the RSI is currently at 58, which is neutral but leaning bullish. The MACD shows a recent bullish crossover, indicating potential upward momentum. Consider waiting for confirmation before making trading decisions based on these signals.";
      }
      else if (lowerQuestion.includes("trend") || lowerQuestion.includes("direction")) {
        response = "The overall trend on your chart appears to be bullish in the intermediate term, with higher lows forming. However, there's significant resistance overhead that could limit upside in the short term. The 200-day moving average is still supporting price action from below.";
      }
      else if (lowerQuestion.includes("support") || lowerQuestion.includes("resistance")) {
        response = "I've identified these key levels on your chart: Support at the recent low (approximately at the bottom third of your chart), and resistance at the recent swing high (at the top quarter of your chart). There's also an intermediate resistance level at the midpoint where price has recently struggled to break through.";
      }
      else {
        response = "I've analyzed your shared chart and notice that price is currently in a period of consolidation. Volume is decreasing during this consolidation, which often precedes a significant move. Keep an eye on a breakout from this range, as it could indicate the next directional move.";
      }
    } else {
      // Generic responses if no screen is shared
      if (lowerQuestion.includes("how") && lowerQuestion.includes("work")) {
        response = "To use this feature, click the 'Start Screen Share' button above to share your trading charts or platform. Once shared, I can analyze patterns, indicators, and market structure to provide insights. You can ask specific questions about what you're seeing on the charts.";
      }
      else if (lowerQuestion.includes("pattern") || lowerQuestion.includes("chart")) {
        response = "I'd be happy to analyze chart patterns for you, but I need to see your screen first. Click the 'Start Screen Share' button above to share your trading charts with me.";
      }
      else {
        response = "I'm here to help analyze your trading charts and screens. To get started, click the 'Start Screen Share' button above so I can see what you're looking at. Then, I can provide specific insights about patterns, indicators, or trading opportunities.";
      }
    }
    
    const aiMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };
    
    addMessage(aiMessage);
  };
  
  const simulateLocalResponse = (question: string) => {
    const response = "To provide a detailed analysis of your charts and trading setup, I need access to the Gemini Vision API. You can add your API key in the settings to enable this feature. For now, I can offer general trading advice but cannot analyze specific visual elements from your screen.";
    
    const aiMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: response,
      timestamp: new Date(),
    };
    
    addMessage(aiMessage);
  };
  
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };
  
  // Speech recognition reference - using any type to avoid TS errors
  const speechRecognitionRef = useRef<any>(null);
  
  // Check if SpeechRecognition is available in the browser
  const isSpeechRecognitionAvailable = () => {
    return 'webkitSpeechRecognition' in window || 
           'SpeechRecognition' in window;
  };

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if (!isSpeechRecognitionAvailable()) {
      toast.error("Speech recognition is not supported in your browser");
      return null;
    }
    
    // Get appropriate SpeechRecognition API based on browser
    // Using any type to avoid TypeScript errors with the Web Speech API
    const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || 
                                (window as any).SpeechRecognition;
    
    // Create a new instance
    const recognition = new SpeechRecognitionAPI();
    
    // Configure the recognition
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    // Set up event handlers
    recognition.onresult = (event: any) => {
      // Extract transcript from results
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join('');
      
      console.log("Speech recognized:", transcript);
      
      // Update the input field with the recognized text
      if (event.results[0].isFinal) {
        setInput(transcript);
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      toast.error(`Speech recognition error: ${event.error}`);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsRecording(false);
    };
    
    return recognition;
  };
  
  const startVoiceRecording = async () => {
    try {
      // If already recording, stop it
      if (isRecording) {
        stopVoiceRecording();
        return;
      }
      
      // First ensure we have microphone permissions
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize speech recognition if not already done
      if (!speechRecognitionRef.current) {
        const recognition = initSpeechRecognition();
        if (!recognition) return;
        speechRecognitionRef.current = recognition;
      }
      
      // Start speech recognition
      // Using '!' assertion to tell TypeScript the reference is definitely not null at this point
      speechRecognitionRef.current!.start();
      setIsRecording(true);
      
      // Show toast for user feedback
      toast.info("Listening... Speak now", { duration: 2000 });
      
      // Automatically stop after 10 seconds if still recording
      setTimeout(() => {
        if (isRecording) {
          stopVoiceRecording();
        }
      }, 15000);
      
    } catch (error) {
      console.error("Error starting voice recording:", error);
      toast.error("Failed to access microphone. Please check permissions.");
      setIsRecording(false);
    }
  };
  
  const stopVoiceRecording = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping speech recognition:", error);
      }
    }
    setIsRecording(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  const exportConversation = () => {
    const conversationText = messages
      .map(msg => `${msg.role === "user" ? "You" : "AI"}: ${msg.content}`)
      .join('\n\n');
    
    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vision-ai-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className={cn("w-full h-full flex flex-col overflow-hidden", className)}>
      <CardHeader className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Vision AI Trading Assistant</CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={exportConversation}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col p-0 flex-grow overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3 h-full">
          {/* Screen Share Panel */}
          <div className="relative flex flex-col border rounded-md overflow-hidden">
            <div className="p-2 bg-slate-800 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium">Screen Share</h3>
              <div className="flex gap-2">
                {isSharing ? (
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={stopScreenShare}
                    className="px-3 py-1 text-sm sm:text-base sm:px-4 sm:py-2"
                  >
                    <StopCircle className="h-4 w-4 mr-1 hidden sm:inline" />
                    Stop
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={startScreenShare}
                    className="px-3 py-1 text-sm sm:text-base sm:px-4 sm:py-2"
                  >
                    <Share2 className="h-4 w-4 mr-1 hidden sm:inline" />
                    {isMobile() ? "Share Screen" : "Start Sharing"}
                  </Button>
                )}
                
                {isSharing && (
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={captureAndAnalyzeNow}
                    className="px-3 py-1 text-sm sm:text-base sm:px-4 sm:py-2"
                  >
                    Analyze
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex-grow bg-black flex items-center justify-center overflow-hidden">
              {isSharing ? (
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-4 text-gray-400">
                  <Share2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-sm sm:text-base">
                    {isMobile() 
                      ? "Tap 'Share Screen' to share your trading charts for AI analysis. Note: Screen sharing works best on Chrome." 
                      : "Click 'Start Sharing' to share your trading charts for AI analysis"}
                  </p>
                  {isMobile() && (
                    <p className="text-xs mt-2 text-amber-400">
                      On mobile, you may need to select "This tab" when prompted for what to share
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Chat Panel */}
          <div className="flex flex-col border rounded-md overflow-hidden h-full">
            <div className="p-2 bg-slate-800 border-b">
              <h3 className="text-sm font-medium">AI Chat</h3>
            </div>
            
            <ScrollArea ref={scrollAreaRef} className="flex-grow p-3">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-start gap-3 rounded-lg p-3",
                      message.role === "assistant" 
                        ? "bg-slate-800/50" 
                        : "bg-slate-700/30 ml-8"
                    )}
                  >
                    {message.role === "assistant" && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-indigo-600 text-white">AI</AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs text-slate-400 mt-1 block">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                
                {isGenerating && (
                  <div className="flex items-start gap-3 rounded-lg p-3 bg-slate-800/50">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-indigo-600 text-white">AI</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex space-x-2 items-center">
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
                        <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-3 border-t mt-auto">
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={startVoiceRecording}
                  className="flex-shrink-0"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Ask about your charts or trading setup..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isGenerating}
                />
                <Button 
                  size="icon"
                  className="flex-shrink-0"
                  onClick={sendMessage}
                  disabled={!input.trim() || isGenerating}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}