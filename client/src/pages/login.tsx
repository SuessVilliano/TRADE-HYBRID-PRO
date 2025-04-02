import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSolanaAuth } from "../lib/context/SolanaAuthProvider";
import { useAuth } from "../lib/context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { 
    isAuthenticating, 
    isAuthenticated, 
    error, 
    connectAndAuthenticate, 
    authenticateWithCredentials 
  } = useSolanaAuth();
  
  const auth = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  
  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  // Handle form submission for credential login
  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      console.error("Please enter both username and password");
      return;
    }
    
    const success = await authenticateWithCredentials(username, password);
    if (success) {
      console.log("Login successful");
      navigate("/dashboard");
    }
  };
  
  // Handle wallet authentication
  const handleWalletAuth = async () => {
    try {
      await connectAndAuthenticate();
      if (!error) {
        console.log("Wallet authentication successful");
      }
    } catch (err) {
      console.error("Failed to authenticate with wallet");
    }
  };
  
  // Handle Whop authentication
  const handleWhopAuth = () => {
    window.location.href = '/api/whop/login';
  };
  
  // Handle demo login
  const handleDemoLogin = async () => {
    try {
      setLoginStatus("Logging in with demo account...");
      
      // Use the AuthContext to perform demo login
      const userData = await auth.loginWithDemo();
      
      console.log("Demo login successful with user data:", userData);
      
      // First navigate to dashboard using simple navigation
      navigate("/dashboard");
      
      // Additional debugging to help track the redirect
      setTimeout(() => {
        console.log("Current location after demo login:", window.location.pathname);
        if (window.location.pathname === '/login') {
          console.log("Still on login page, attempting to redirect again...");
          window.location.href = '/dashboard';
        }
      }, 1000);
      
    } catch (err) {
      console.error("Demo login failed:", err);
      setLoginStatus("Demo login failed. Please try again.");
    }
  };
  
  // Handle registration (would connect to register API)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !email) {
      console.error("Please fill all fields");
      return;
    }
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          email,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log("Registration successful. Please login.");
        setShowRegister(false);
      } else {
        console.error(data.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration failed");
    }
  };
  
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="w-full max-w-md m-auto bg-gray-800 rounded-lg border border-gray-700 shadow-lg p-8">
        <div className="text-center mb-6">
          <img 
            src="https://assets.vbt.io/public/files/19952/trade_hybrid_logo.png" 
            alt="Trade Hybrid Logo" 
            className="h-16 w-auto object-contain mx-auto mb-4" 
          />
          <h1 className="text-3xl font-bold">
            {showRegister ? "Create Account" : "Welcome Back"}
          </h1>
        </div>
        
        {error && (
          <div className="bg-red-800/50 border border-red-600 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {!showRegister ? (
          <>
            {/* Login Form */}
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-800 font-medium rounded-lg px-5 py-2.5 text-white"
              >
                {isAuthenticating ? "Logging in..." : "Login"}
              </button>
            </form>
            
            <div className="mt-4 flex items-center justify-center">
              <span className="border-b w-1/3 border-gray-600"></span>
              <span className="px-2 text-gray-400">or</span>
              <span className="border-b w-1/3 border-gray-600"></span>
            </div>
            
            <div className="space-y-3 mt-4">
              <button
                onClick={handleWhopAuth}
                disabled={isAuthenticating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg px-5 py-3 text-white flex items-center justify-center transform hover:scale-[1.02] transition-all"
              >
                <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2">
                  <path d="M15.3 20L5 30.3V5h20.3L15.3 15.3V20zm4.4 0v-4.7L30 5h5v25.3L19.7 15z" fill="currentColor"/>
                </svg>
                Sign in with Whop
              </button>

              <button
                onClick={handleWalletAuth}
                disabled={isAuthenticating}
                className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-800 font-medium rounded-lg px-5 py-2.5 text-white flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 100-12 6 6 0 000 12z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Connect Wallet
              </button>
              
              <button
                onClick={handleDemoLogin}
                disabled={isAuthenticating}
                className="w-full bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-800 font-medium rounded-lg px-5 py-2.5 text-white flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 12a2 2 0 100-4 2 2 0 000 4z"
                  ></path>
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Demo Login
              </button>
              
              {loginStatus && (
                <div className="bg-blue-800/50 border border-blue-600 text-white p-3 rounded mt-2">
                  {loginStatus}
                </div>
              )}
            </div>
            
            <div className="text-sm font-medium text-gray-400 mt-4 text-center">
              Don't have an account?{" "}
              <button
                className="text-blue-500 hover:underline"
                onClick={() => setShowRegister(true)}
              >
                Create one
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Register Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="register-username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <input
                  type="text"
                  id="register-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="register-password" className="block text-sm font-medium mb-1">
                  Password
                </label>
                <input
                  type="password"
                  id="register-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg px-5 py-2.5 text-white"
              >
                Register
              </button>
              
              <div className="text-sm font-medium text-gray-400 text-center">
                Already have an account?{" "}
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => setShowRegister(false)}
                >
                  Login
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}