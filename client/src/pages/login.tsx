
import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaAuth } from '@/lib/context/SolanaAuthProvider';
import { useRouter } from 'next/router';

export default function LoginPage() {
  const { user, isAuthenticated } = useUserStore();
  const { isWalletAuthenticated } = useSolanaAuth();
  const router = useRouter();
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated || isWalletAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isWalletAuthenticated]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8 bg-card rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <WalletMultiButton className="w-full" />
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <button 
              onClick={() => window.location.href = '/api/whop/login'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Login with Whop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
