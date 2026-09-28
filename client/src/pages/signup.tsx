import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Info, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';

export default function SignupPage() {
  const navigate = useNavigate();
  const { getCurrentUser } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) return setError('Passwords do not match');
    if (password.length < 8) return setError('Password must be at least 8 characters long');
    if (!agreeToTerms) return setError('You must agree to the terms and conditions');
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username.trim(), email: email.trim().toLowerCase(), password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || 'Could not create your account');
      await getCurrentUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] px-4 py-12 text-white">
      <div className="w-full max-w-md space-y-7 rounded-3xl border border-cyan-300/15 bg-white/[0.04] p-8 shadow-2xl shadow-cyan-950/30">
        <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300">Trade Hybrid Club</p><h1 className="mt-3 text-3xl font-black">Create your Club account</h1><p className="mt-2 text-sm text-slate-400">One login for your Journal, Battles, Academy, tools, and membership access.</p></div>
        {error && <div className="flex items-center gap-2 rounded-xl border border-rose-300/20 bg-rose-400/10 p-3 text-sm text-rose-200"><Info className="h-4 w-4 shrink-0" />{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div><Label htmlFor="username">Username</Label><Input id="username" name="username" autoComplete="username" required value={username} onChange={e => setUsername(e.target.value)} className="mt-2 bg-black/20" /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-2 bg-black/20" /></div>
          <div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-2 bg-black/20" /></div>
          <div><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="mt-2 bg-black/20" /></div>
          <label className="flex items-start gap-3 text-sm text-slate-300"><Checkbox id="terms" checked={agreeToTerms} onCheckedChange={checked => setAgreeToTerms(Boolean(checked))} /><span>I agree to the <Link to="/terms" className="text-cyan-300 hover:underline">Terms</Link> and <Link to="/privacy" className="text-cyan-300 hover:underline">Privacy Policy</Link>.</span></label>
          <Button type="submit" className="w-full bg-gradient-to-r from-cyan-400 to-violet-500 font-bold text-slate-950" disabled={loading || !agreeToTerms}>{loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account…</> : <>Create account <ArrowRight className="ml-2 h-4 w-4" /></>}</Button>
        </form>
        <div className="text-center text-sm text-slate-400">Already have an account? <Link to="/login" className="font-semibold text-cyan-300 hover:underline">Log in</Link></div>
      </div>
    </div>
  );
}
