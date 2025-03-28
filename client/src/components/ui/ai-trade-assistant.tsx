import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Mic, Send, Share, StopCircle, Download } from 'lucide-react';
import { useUserStore } from '../../lib/stores/useUserStore';

interface Message {
  text: string;
  type: 'user' | 'assistant';
  timestamp: string;
}

const AiTradeAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your trading assistant. Feel free to share your screen and ask questions about your trading charts.",
      type: 'assistant',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUserStore();
  
  // Check if browser supports Speech Recognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  
  useEffect(() => {
    // Set up speech recognition if available
    if (recognition) {
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        if (finalTranscript) {
          setInputText(finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceInput();
      };
    }
    
    // Scroll to bottom when messages change
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    
    if (isRecording) {
      stopVoiceInput();
    } else {
      startVoiceInput();
    }
  };
  
  const startVoiceInput = () => {
    if (recognition) {
      recognition.start();
      setIsRecording(true);
    }
  };
  
  const stopVoiceInput = () => {
    if (recognition) {
      recognition.stop();
      setIsRecording(false);
    }
  };
  
  const startScreenShare = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      } as MediaStreamConstraints);
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsScreenSharing(true);
      addMessage("Screen sharing started successfully.", "assistant");
      
      mediaStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });
    } catch (err: any) {
      console.error("Error: " + err);
      addMessage("Failed to start screen sharing: " + err.message, "assistant");
    }
  };
  
  const stopScreenShare = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setStream(null);
      setIsScreenSharing(false);
      addMessage("Screen sharing stopped.", "assistant");
    }
  };
  
  const addMessage = (text: string, type: 'user' | 'assistant') => {
    setMessages(prevMessages => [
      ...prevMessages,
      { text, type, timestamp: new Date().toISOString() }
    ]);
  };
  
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = inputText.trim();
    addMessage(userMessage, 'user');
    setInputText('');
    stopVoiceInput();
    
    // Simulate AI thinking
    setTimeout(async () => {
      try {
        // Check if we have OpenAI API Key - Don't display the actual key
        const apiKey = user.apiKeys?.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
        
        if (!apiKey) {
          addMessage("To use AI responses, please add your OpenAI API key in the settings. For now, I'll be providing generic responses.", "assistant");
          generateGenericResponse(userMessage);
          return;
        }
        
        // In a real implementation, you would make an API call here
        // This is a simulated response for demonstration
        simulateAIResponse(userMessage);
        
      } catch (error: any) {
        console.error('Error:', error);
        addMessage("Sorry, there was an error processing your request.", "assistant");
      }
    }, 1000);
  };
  
  const simulateAIResponse = (userMessage: string) => {
    // Simple response simulation based on keywords
    const lowercaseMessage = userMessage.toLowerCase();
    
    if (lowercaseMessage.includes('chart') || lowercaseMessage.includes('pattern')) {
      addMessage("I can see a potential trend forming in your chart. The price is showing higher lows which could indicate bullish momentum. Consider watching for a breakout above the recent resistance level.", "assistant");
    } else if (lowercaseMessage.includes('indicator') || lowercaseMessage.includes('rsi') || lowercaseMessage.includes('macd')) {
      addMessage("The indicators are showing mixed signals. The RSI is around mid-levels, not showing extreme overbought or oversold conditions. The MACD histogram is showing decreasing bearish momentum, which could be a sign of a potential reversal soon.", "assistant");
    } else if (lowercaseMessage.includes('buy') || lowercaseMessage.includes('long')) {
      addMessage("Before entering a long position, make sure to check the overall market trend and set proper stop loss levels. The current risk-to-reward ratio might not be favorable unless you're looking at a longer timeframe.", "assistant");
    } else if (lowercaseMessage.includes('sell') || lowercaseMessage.includes('short')) {
      addMessage("For short positions, be mindful of potential support levels and any divergence in indicators. The market could experience a bounce if it reaches historical support zones.", "assistant");
    } else if (lowercaseMessage.includes('hello') || lowercaseMessage.includes('hi') || lowercaseMessage.includes('hey')) {
      addMessage(`Hello! I'm your AI trading assistant. How can I help you analyze your trades today?`, "assistant");
    } else if (lowercaseMessage.includes('thank')) {
      addMessage("You're welcome! Let me know if you need any more help with your trading analysis.", "assistant");
    } else {
      generateGenericResponse(userMessage);
    }
  };
  
  const generateGenericResponse = (userMessage: string) => {
    const genericResponses = [
      "Based on what I can see, the market is showing some interesting patterns. Consider watching key support and resistance levels for your next trade.",
      "When analyzing this chart, remember to look at multiple timeframes to confirm the trend direction and potential entry points.",
      "Risk management is crucial here. Make sure your position size aligns with your risk tolerance and always use stop losses.",
      "Technical analysis suggests watching for confirmation signals before entering a trade. Look for candlestick patterns that validate your hypothesis.",
      "Consider checking the volume profile along with price action. Increasing volume on breakouts tends to confirm the strength of the move."
    ];
    
    const randomIndex = Math.floor(Math.random() * genericResponses.length);
    addMessage(genericResponses[randomIndex], "assistant");
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const exportConversation = () => {
    let conversationText = '';
    messages.forEach(message => {
      const messageType = message.type === 'user' ? 'You' : 'Assistant';
      const timestamp = new Date(message.timestamp).toLocaleTimeString();
      conversationText += `[${timestamp}] ${messageType}: ${message.text}\n\n`;
    });
    
    // Create a downloadable file
    const element = document.createElement('a');
    const file = new Blob([conversationText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `trading_assistant_chat_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden flex flex-col h-full">
      <div className="border-b border-slate-700 p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">AI Trading Assistant</h2>
          <Button variant="outline" size="sm" onClick={exportConversation}>
            <Download className="h-4 w-4 mr-2" />
            Export Chat
          </Button>
        </div>
      </div>
      
      <div className="p-4 flex flex-col gap-4 h-full">
        <div className="flex gap-2">
          <Button
            variant={isScreenSharing ? "destructive" : "default"}
            size="sm"
            onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          >
            {isScreenSharing ? (
              <>
                <StopCircle className="h-4 w-4 mr-2" />
                Stop Sharing
              </>
            ) : (
              <>
                <Share className="h-4 w-4 mr-2" />
                Share Screen
              </>
            )}
          </Button>
        </div>
        
        {isScreenSharing && (
          <div className="w-full h-48 bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              autoPlay
              playsInline
              muted
            />
          </div>
        )}
        
        <div 
          ref={messagesContainerRef}
          className="flex-grow overflow-y-auto border border-slate-700 rounded-lg p-4 space-y-4"
          style={{ maxHeight: isScreenSharing ? '250px' : '350px' }}
        >
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`
                p-3 rounded-lg max-w-[85%] break-words
                ${message.type === 'user' 
                  ? 'bg-blue-500/20 border border-blue-500/40 ml-auto' 
                  : 'bg-slate-800 border border-slate-700'
                }
              `}
            >
              {message.text}
            </div>
          ))}
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            onClick={toggleVoiceInput}
            className={`rounded-full ${isRecording ? 'animate-pulse' : ''}`}
          >
            <Mic className="h-5 w-5" />
          </Button>
          
          <input
            type="text"
            className="flex-grow bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Ask about your trading charts..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
          />
          
          <Button onClick={handleSendMessage}>
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiTradeAssistant;