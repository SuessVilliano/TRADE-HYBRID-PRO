import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/context/AuthContext";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, Loader2, HelpCircle, KeyRound, Info } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/dashboard");
    }
    
    // Cleanup function to clear any timeouts when component unmounts
    return () => {
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
    };
  }, [auth.isAuthenticated, navigate]);
  
  // Function to handle Whop login
  const handleWhopLogin = async (whopId: string) => {
    try {
      // Clear any existing timeouts
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      setIsLoggingIn(true);
      setLoginStatus(`Authenticating with ID: ${whopId}...`);
      
      // Set a timeout to handle potential login hangs
      loginTimeoutRef.current = setTimeout(() => {
        setIsLoggingIn(false);
        setLoginStatus("Login timed out. Please try again or use the forgot password option.");
      }, 15000); // 15 seconds timeout
      
      // Use the AuthContext to perform login
      const userData = await auth.login(whopId);
      
      // Clear the timeout since login succeeded
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      console.log("Login successful with user data:", userData);
      setLoginStatus("Login successful! Redirecting...");
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (err) {
      // Clear the timeout since login failed with an error
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      console.error("Login failed:", err);
      setLoginStatus("Login failed. Please check your ID and try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Handle credential login
  const handleLogin = () => {
    if (username) {
      handleWhopLogin(username);
    }
  };
  
  // Handle demo login
  const handleDemoLogin = async () => {
    try {
      // Clear any existing timeouts
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      setIsLoggingIn(true);
      setLoginStatus("Logging in with demo account...");
      
      // Set a timeout to handle potential login hangs
      loginTimeoutRef.current = setTimeout(() => {
        setIsLoggingIn(false);
        setLoginStatus("Demo login timed out. Please try again.");
      }, 15000); // 15 seconds timeout
      
      // Use the AuthContext to perform demo login
      const userData = await auth.loginWithDemo();
      
      // Clear the timeout since login succeeded
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      console.log("Demo login successful with user data:", userData);
      setLoginStatus("Demo login successful! Redirecting...");
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (err) {
      // Clear the timeout since login failed with an error
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      console.error("Demo login failed:", err);
      setLoginStatus("Demo login failed. Please try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="w-full max-w-md m-auto bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-8">
        <div className="text-center mb-6">
          {/* Platform Logo with Proper Fallback */}
          <div className="relative h-16 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/images/trade_hybrid_logo.png" 
              alt="Trade Hybrid Logo" 
              className="h-16 w-auto object-contain" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                console.log("Logo load error - using fallback");
                target.onerror = null;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyMDAgNTAiPjxkZWZzPjxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMGZmYWE7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDBhYWZmO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjx0ZXh0IHg9IjEwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0idXJsKCNncmFkaWVudCkiIHRleHQtYW5jaG9yPSJzdGFydCI+VHJhZGUgSHlicmlkPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
            
            {/* Fallback SVG Logo (displayed only if image fails to load) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="150" 
                height="40" 
                viewBox="0 0 200 50"
                className="h-12 mx-auto"
              >
                <defs>
                  <linearGradient id="thGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00ffaa', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#00aaff', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <text 
                  x="10" 
                  y="35" 
                  fontFamily="Arial, sans-serif" 
                  fontSize="24" 
                  fontWeight="bold" 
                  fill="url(#thGradient)" 
                  textAnchor="start"
                >
                  Trade Hybrid
                </text>
              </svg>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white">
            Welcome to Trade Hybrid
          </h1>
          <p className="mt-2 text-gray-300">The future of decentralized trading</p>
        </div>
        
        <div className="space-y-6 mt-8">
          {/* Credential Login Form */}
          <form className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                placeholder="Enter your username"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                placeholder="Enter your password"
              />
            </div>
            
            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg px-5 py-2.5 text-white flex items-center justify-center"
              disabled={!username || isLoggingIn}
              onClick={handleLogin}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Login with Whop ID"
              )}
            </button>
          </form>
          
          <div className="flex items-center justify-center">
            <div className="border-b w-1/3 border-gray-600"></div>
            <div className="px-2 text-gray-400">or</div>
            <div className="border-b w-1/3 border-gray-600"></div>
          </div>
          
          {/* Quick Access Button */}
          <button
            onClick={handleDemoLogin}
            disabled={isLoggingIn}
            className="w-full bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-800 font-medium rounded-lg px-5 py-3 text-white flex items-center justify-center"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Demo Login (Quick Access)
              </>
            )}
          </button>
          
          {/* Forgot Password Link */}
          <div className="flex justify-end mt-2">
            <a 
              href="https://whop.com/forgot-password" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
            >
              <KeyRound className="h-3 w-3 mr-1" />
              Forgot Password?
            </a>
          </div>
          
          {loginStatus && (
            <Alert variant={loginStatus.includes("failed") ? "destructive" : "default"} 
                  className={`mt-4 ${loginStatus.includes("failed") ? "bg-red-900/20 border-red-800" : "bg-blue-900/20 border-blue-800"}`}>
              {loginStatus.includes("failed") ? (
                <AlertCircle className="h-4 w-4 mr-2" />
              ) : (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <AlertDescription>
                {loginStatus}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Need Help / Troubleshooting */}
          <div className="mt-6 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-white">Need help logging in?</h4>
                <p className="text-xs text-gray-300 mt-1">
                  If you're having trouble accessing your account, please try:
                </p>
                <ul className="list-disc text-xs text-gray-300 pl-4 mt-1 space-y-1">
                  <li>Verify you're using the correct Whop ID or email</li>
                  <li>Use the 'Forgot Password' link to reset your password</li>
                  <li>
                    <a 
                      href="https://whop.com/help" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Visit Whop Support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-gray-400 mt-4">
            <p>For testing purposes:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Use "demo" to log in as a demo user</li>
              <li>Or enter your Whop ID to use your membership</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}