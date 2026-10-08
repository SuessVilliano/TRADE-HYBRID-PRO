import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bot } from 'lucide-react';
export function OnboardingButton({ className = '' }: { className?: string }) {
  const { pathname } = useLocation();
  if (pathname === '/market-buddy') return null;
  return <Link to="/market-buddy" aria-label="Open Market Buddy chat" className={'fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-3 text-sm font-bold text-white shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ' + className}><Bot size={19}/><span>Market Buddy</span></Link>;
}
