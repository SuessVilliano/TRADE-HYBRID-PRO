import { useState } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Info } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function SignupPage() {
  const { login } = useUserStore();
  const navigate = useNavigate();
  
  // Local state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions');
      setLoading(false);
      return;
    }
    
    try {
      // In a real app, this would call an API to create a user account
      // For demo purposes, we'll just immediately log in the user
      
      // Create and login as a new user
      const mockUser = {
        id: `user-${Date.now()}`,
        username,
        email,
        firstName: '',
        lastName: '',
        role: 'user' as const,
        walletAddress: undefined, // Using undefined instead of null for TypeScript compatibility
        apiKeys: {},
        preferences: { theme: 'dark' },
        joinDate: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      
      // Auto-login after successful registration
      await login(mockUser);
      
      // Redirect to the dashboard
      navigate('/');
    } catch (err) {
      setError('An error occurred during signup');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-xl shadow-lg border border-border">
        <div className="text-center">
          <div className="flex justify-center">
            <img src={logo || '/logo.png'} alt="Trade Hybrid Logo" className="h-20 w-auto mb-4" />
          </div>
          <h2 className="text-3xl font-bold">Create an Account</h2>
          <p className="mt-2 text-muted-foreground">Join the Trade Hybrid platform</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>{error}</span>
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Password must be at least 8 characters
              </p>
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                required
              />
              <Label htmlFor="terms" className="cursor-pointer text-sm">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !agreeToTerms}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : 'Sign up'}
            </Button>
          </div>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-background text-muted-foreground">Or sign up with</span>
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => window.location.href = '/api/whop/login'}
            variant="outline"
            className="w-full"
          >
            <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5">
              <path d="M15.3 20L5 30.3V5h20.3L15.3 15.3V20zm4.4 0v-4.7L30 5h5v25.3L19.7 15z" fill="currentColor"/>
            </svg>
            Sign up with Whop
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}