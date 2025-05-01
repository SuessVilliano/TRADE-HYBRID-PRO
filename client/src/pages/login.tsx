import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../lib/context/AuthContext";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, Loader2, HelpCircle, KeyRound, UserPlus, LogIn, CheckCircle } from "lucide-react";
import { authService } from "../lib/services/auth-service";

export default function LoginPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  
  // Login states
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Registration states
  const [showRegistration, setShowRegistration] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  
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
  
  // Handle direct username/password login
  const handleDirectLogin = async () => {
    try {
      // Clear any existing timeouts
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      setIsLoggingIn(true);
      setLoginStatus("Authenticating...");
      
      // Set a timeout to handle potential login hangs
      loginTimeoutRef.current = setTimeout(() => {
        setIsLoggingIn(false);
        setLoginStatus("Login timed out. Please try again later.");
      }, 15000); // 15 seconds timeout
      
      // Call the auth service directly
      const userData = await authService.login(username, password);
      
      // Clear the timeout since login succeeded
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      console.log("Login successful with user data:", userData);
      setLoginStatus("Login successful! Redirecting...");
      
      // Update auth context
      auth.getCurrentUser();
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (err) {
      // Clear the timeout since login failed with an error
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      console.error("Login failed:", err);
      setLoginStatus("Login failed. Please check your credentials and try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  // Handle Whop login
  const handleWhopLogin = async (whopId: string) => {
    try {
      // Clear any existing timeouts
      if (loginTimeoutRef.current) {
        clearTimeout(loginTimeoutRef.current);
      }
      
      setIsLoggingIn(true);
      setLoginStatus(`Authenticating with Whop ID: ${whopId}...`);
      
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
  
  // Handle registration
  const handleRegistration = async () => {
    // Validate form
    if (!regUsername || !regEmail || !regPassword || !confirmPassword) {
      setRegistrationStatus("All fields are required");
      return;
    }
    
    if (regPassword !== confirmPassword) {
      setRegistrationStatus("Passwords do not match");
      return;
    }
    
    if (regPassword.length < 6) {
      setRegistrationStatus("Password must be at least 6 characters");
      return;
    }
    
    try {
      setIsRegistering(true);
      setRegistrationStatus("Creating your account...");
      
      // Call register API
      const result = await authService.register(regUsername, regEmail, regPassword);
      
      console.log("Registration successful:", result);
      
      if (result.synced) {
        setRegistrationStatus("Account created and synced with your Whop membership! Redirecting...");
      } else {
        setRegistrationStatus("Account created successfully! Redirecting...");
      }
      
      // Update auth context
      auth.getCurrentUser();
      
      // Navigate to dashboard after a brief delay to show the success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
      
    } catch (err: any) {
      console.error("Registration failed:", err);
      setRegistrationStatus(err.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
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
        
        {/* Tabs for Login and Register */}
        <div className="mb-6 flex">
          <button
            onClick={() => setShowRegistration(false)}
            className={`flex-1 py-3 text-center font-medium focus:outline-none ${
              !showRegistration ? "border-b-2 border-blue-500 text-white" : "text-gray-400"
            }`}
          >
            <LogIn className="inline-block w-4 h-4 mr-2" />
            Login
          </button>
          <button
            onClick={() => setShowRegistration(true)}
            className={`flex-1 py-3 text-center font-medium focus:outline-none ${
              showRegistration ? "border-b-2 border-blue-500 text-white" : "text-gray-400"
            }`}
          >
            <UserPlus className="inline-block w-4 h-4 mr-2" />
            Register
          </button>
        </div>
        
        <div className="space-y-6">
          {!showRegistration ? (
            // Login Form
            <>
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
                  disabled={!username || !password || isLoggingIn}
                  onClick={handleDirectLogin}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </>
                  )}
                </button>
                
                {/* Whop ID Login Option */}
                <div className="flex items-center justify-center my-3">
                  <div className="border-b w-1/3 border-gray-600"></div>
                  <div className="px-2 text-gray-400 text-sm">Whop ID Login</div>
                  <div className="border-b w-1/3 border-gray-600"></div>
                </div>
                
                <button
                  type="button"
                  className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-800 font-medium rounded-lg px-5 py-2.5 text-white flex items-center justify-center"
                  disabled={!username || isLoggingIn}
                  onClick={() => {
                    if (username) {
                      setLoginStatus('Authenticating with Whop ID...');
                      setIsLoggingIn(true);
                      auth.login(username)
                        .then(() => {
                          setLoginStatus('Login successful! Redirecting...');
                          navigate('/dashboard');
                        })
                        .catch(error => {
                          console.error("Whop login error:", error);
                          setLoginStatus('Login failed. Please check your Whop ID and try again.');
                        })
                        .finally(() => {
                          setIsLoggingIn(false);
                        });
                    }
                  }}
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
                  href="#" 
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
            </>
          ) : (
            // Registration Form
            <>
              <form className="space-y-4">
                <div>
                  <label htmlFor="reg-username" className="block text-sm font-medium text-white mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="reg-username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                    placeholder="Choose a username"
                  />
                </div>
                
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-white mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                    placeholder="Enter your email"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    If your email matches a Whop membership, we'll automatically sync your account benefits
                  </p>
                </div>
                
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-white mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    id="reg-password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                    placeholder="Create a password"
                  />
                </div>
                
                <div>
                  <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-white mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="reg-confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 bg-gray-700 border border-gray-600 text-white rounded-lg"
                    placeholder="Confirm your password"
                  />
                </div>
                
                <button
                  type="button"
                  className="w-full bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-800 font-medium rounded-lg px-5 py-2.5 text-white flex items-center justify-center"
                  disabled={isRegistering}
                  onClick={handleRegistration}
                >
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </button>
              </form>
              
              {registrationStatus && (
                <Alert variant={registrationStatus.includes("failed") || registrationStatus.includes("error") ? "destructive" : "default"} 
                      className={`mt-4 ${registrationStatus.includes("failed") || registrationStatus.includes("error") ? "bg-red-900/20 border-red-800" : "bg-blue-900/20 border-blue-800"}`}>
                  {registrationStatus.includes("failed") || registrationStatus.includes("error") ? (
                    <AlertCircle className="h-4 w-4 mr-2" />
                  ) : registrationStatus.includes("success") ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  <AlertDescription>
                    {registrationStatus}
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
          
          {/* Help Section */}
          <div className="mt-6 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-white">Need help?</h4>
                <p className="text-xs text-gray-300 mt-1">
                  {showRegistration ? 
                    "Create an account to access Trade Hybrid. If you have a Whop membership, use the same email to automatically receive your benefits." : 
                    "You can log in with your username and password, or use your Whop ID if you have a membership."}
                </p>
                {!showRegistration && (
                  <p className="text-xs text-gray-300 mt-2">
                    Don't have an account? <button 
                      onClick={() => setShowRegistration(true)}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Create one now
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}