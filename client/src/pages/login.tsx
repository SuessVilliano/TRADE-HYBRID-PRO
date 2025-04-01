import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSolanaAuth } from "../lib/context/SolanaAuthProvider";

export default function LoginPage() {
  const navigate = useNavigate();
  const { 
    isAuthenticating, 
    isAuthenticated, 
    error, 
    connectAndAuthenticate, 
    authenticateWithCredentials 
  } = useSolanaAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState("");
  
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
        <h1 className="text-3xl font-bold text-center mb-6">
          {showRegister ? "Create Account" : "Trade Hybrid"}
        </h1>
        
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
            
            <div className="mt-4">
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