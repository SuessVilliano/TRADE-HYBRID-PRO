import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Info, CheckCircle2 } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would call an API to send a password reset email
      // For demo purposes, we'll just simulate a successful request
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set success state
      setSuccess(true);
    } catch (err) {
      setError('An error occurred while sending the reset link');
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
          <h2 className="text-3xl font-bold">Reset Password</h2>
          <p className="mt-2 text-muted-foreground">
            {success 
              ? "Check your email for the reset link" 
              : "Enter your email to receive a password reset link"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="bg-success/10 text-success p-4 rounded-md flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-medium">Reset link sent</p>
                <p className="text-sm">We've sent a password reset link to {email}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you don't see the email in your inbox, please check your spam folder.
                The link will expire in 1 hour.
              </p>
              
              <div className="flex flex-col space-y-3">
                <Button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                >
                  Try another email
                </Button>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Return to login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email address</Label>
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

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : 'Send reset link'}
              </Button>
              
              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}