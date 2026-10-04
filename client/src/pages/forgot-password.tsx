import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Info, CheckCircle2 } from 'lucide-react';
import { authService } from '@/lib/services/auth-service';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.requestPasswordReset(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while sending the reset link');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-white/10 bg-white p-8 shadow-2xl dark:bg-[#0b1020]">
        <div className="text-center">
          <div className="flex justify-center">
            <img
              src="https://tradehybrid.co/trade-hybrid-logo.png"
              alt="Trade Hybrid Logo"
              className="mb-4 h-16 w-auto"
            />
          </div>
          <h2 className="font-display text-3xl font-medium">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {success
              ? 'Check your email for the reset link'
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-red-700 dark:bg-red-500/10 dark:text-red-300">
            <Info className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 rounded-md bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
              <div>
                <p className="font-semibold">Reset link sent</p>
                <p className="text-sm">We've sent a password reset link to {email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
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
                <Link to="/login" className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
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
