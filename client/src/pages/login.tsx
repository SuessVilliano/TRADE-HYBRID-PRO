import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaAuth } from '@/lib/context/SolanaAuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Info } from 'lucide-react';
import '@solana/wallet-adapter-react-ui/styles.css';
import '@/styles/wallet-adapter.css';

//This line is changed to use a direct path instead of an import statement
const logo = '/logo.png';


export default function LoginPage() {
  const { user, isAuthenticated, login } = useUserStore();
  const { isWalletAuthenticated, loginWithSolana, isAuthenticatingWithSolana, solanaAuthError } = useSolanaAuth();
  const navigate = useNavigate();

  // Local state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for saved credentials
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated || isWalletAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, isWalletAuthenticated, navigate]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const success = await login(username, password);

      if (success) {
        // Save username if "remember me" is checked
        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
        } else {
          localStorage.removeItem('rememberedUsername');
        }

        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle wallet login
  const handleWalletLogin = async () => {
    try {
      const success = await loginWithSolana();
      if (success) {
        navigate('/');
      }
    } catch (err) {
      console.error('Wallet login error:', err);
    }
  };

  // Handle demo mode login
  const handleDemoLogin = () => {
    // Login as demo user
    useUserStore.getState().login({
      id: 'demo-user',
      username: 'Demo User',
      email: 'demo@tradehybrid.com',
      role: 'demo' as const, // Use const assertion for correct typing
      walletAddress: undefined, // Using undefined instead of null for TypeScript compatibility
      apiKeys: {},
      preferences: { theme: 'dark' },
      joinDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <div className="flex justify-center">
            <img src={logo || '/logo.png'} alt="Trade Hybrid Logo" className="h-20 w-auto mb-4" />
          </div>
          <h2 className="text-3xl font-bold">Welcome to Trade Hybrid</h2>
          <p className="mt-2 text-muted-foreground">Sign in to continue to your account</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {solanaAuthError && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>{solanaAuthError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember-me" className="cursor-pointer">Remember me</Label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="text-primary hover:underline">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </Button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="wallet-wrapper w-full flex justify-center">
            <WalletMultiButton 
              className="wallet-adapter-button-custom w-full flex justify-center items-center gap-2 text-center bg-transparent hover:bg-gray-700 border border-gray-600 rounded-md px-4 py-2"
            />
          </div>
          
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleWalletLogin}
              disabled={isAuthenticatingWithSolana}
            >
              {isAuthenticatingWithSolana ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Authenticating with wallet...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.4384 11.7967C17.3163 11.6281 17.1352 11.5316 16.9399 11.5316H1.84311C1.49963 11.5316 1.2839 11.9018 1.42666 12.1952L6.56173 21.8344C6.684 22.0029 6.86504 22.0994 7.06032 22.0994H22.1571C22.5006 22.0994 22.7163 21.7291 22.5736 21.4358L17.4384 11.7967Z" fill="url(#paint0_linear)" />
                    <path d="M17.4384 4.66548C17.3197 4.49548 17.1379 4.3982 16.9399 4.3982H1.84311C1.49963 4.3982 1.2839 4.76968 1.42666 5.06428L6.56173 14.7169C6.68399 14.887 6.86504 14.9842 7.06032 14.9842H22.1571C22.5006 14.9842 22.7163 14.6127 22.5736 14.3181L17.4384 4.66548Z" fill="url(#paint1_linear)" />
                    <path d="M6.56173 7.1676C6.684 6.9976 6.86505 6.90004 7.06033 6.90004H22.1571C22.5006 6.90004 22.7163 7.27152 22.5736 7.56612L17.4385 17.2188C17.3163 17.3874 17.1352 17.4839 16.9399 17.4839H1.84311C1.49963 17.4839 1.2839 17.1136 1.42666 16.8202L6.56173 7.1676Z" fill="url(#paint2_linear)" />
                    <defs>
                      <linearGradient id="paint0_linear" x1="17.8487" y1="6.05212" x2="6.93851" y2="27.0892" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF9E00" />
                        <stop offset="1" stopColor="#9E00FF" />
                      </linearGradient>
                      <linearGradient id="paint1_linear" x1="14.8701" y1="4.3982" x2="4.13027" y2="21.6992" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00FFBD" />
                        <stop offset="1" stopColor="#00FFEA" />
                      </linearGradient>
                      <linearGradient id="paint2_linear" x1="21.5716" y1="7.52761" x2="6.32996" y2="17.3926" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#00D1FF" />
                        <stop offset="1" stopColor="#9000FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  Authenticate with Connected Wallet
                </>
              )}
            </Button>
          </div>

          <Button 
            onClick={() => window.location.href = '/api/whop/login'}
            variant="outline"
            className="w-full"
          >
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5">
              <path d="M15.3 20L5 30.3V5h20.3L15.3 15.3V20zm4.4 0v-4.7L30 5h5v25.3L19.7 15z" fill="currentColor"/>
            </svg>
            Login with Whop
          </Button>

          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or try demo</span>
            </div>
          </div>

          <Button 
            onClick={handleDemoLogin}
            variant="secondary"
            className="w-full"
          >
            Enter Demo Mode
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}