import React, { useEffect } from 'react';
import { CLUB_LINKS } from '@/lib/club-links';
export default function AcademyRedirect() {
  useEffect(() => { window.location.replace(CLUB_LINKS.academy); }, []);
  return <main className="bg-slate-50 p-8 text-slate-950"><p>Opening Trade Hybrid Academy…</p><a href={CLUB_LINKS.academy}>Continue to Academy</a></main>;
}
