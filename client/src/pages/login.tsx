import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/context/AuthContext";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/dashboard");
    }
  }, [auth.isAuthenticated, navigate]);
  
  // Function to handle Whop login
  const handleWhopLogin = async (whopId: string) => {
    try {
      setIsLoggingIn(true);
      setLoginStatus(`Authenticating with ID: ${whopId}...`);
      
      // Use the AuthContext to perform login
      const userData = await auth.login(whopId);
      
      console.log("Login successful with user data:", userData);
      setLoginStatus("Login successful! Redirecting...");
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (err) {
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
      setIsLoggingIn(true);
      setLoginStatus("Logging in with demo account...");
      
      // Use the AuthContext to perform demo login
      const userData = await auth.loginWithDemo();
      
      console.log("Demo login successful with user data:", userData);
      setLoginStatus("Demo login successful! Redirecting...");
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (err) {
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
          <img 
            src="/images/trade_hybrid_logo.png" 
            alt="Trade Hybrid Logo" 
            className="h-16 w-auto object-contain mx-auto mb-4" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.log("Logo load error - using fallback");
              target.onerror = null;
              target.style.display = 'none';
            }}
          />
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