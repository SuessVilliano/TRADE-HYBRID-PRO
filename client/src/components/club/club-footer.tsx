import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Bot, Mail, Swords, TerminalSquare, Users } from 'lucide-react';
import { CLUB_LINKS } from '@/lib/club-links';

const productLinks = [
  ['Hybrid Journal', CLUB_LINKS.journal, BookOpen],
  ['Market Buddy', CLUB_LINKS.ai, Bot],
  ['ABATEV Terminal', CLUB_LINKS.terminal, TerminalSquare],
  ['Trade House', CLUB_LINKS.battles, Swords],
  ['Community', CLUB_LINKS.community, Users],
] as const;

function SmartLink({ href, children }: { href: string; children: React.ReactNode }) {
  return /^https?:/i.test(href) ? (
    <a href={href} target="_blank" rel="noreferrer" className="text-sm text-slate-400 transition hover:text-white">{children}</a>
  ) : (
    <Link to={href} className="text-sm text-slate-400 transition hover:text-white">{children}</Link>
  );
}

export default function ClubFooter() {
  return (
    <footer className="bg-[#070a12] text-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white">
                <img src="https://tradehybrid.co/trade-hybrid-logo.png" alt="Trade Hybrid" className="h-9 w-9 object-contain" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-[0.14em]">TRADE HYBRID</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-cyan-300">Club</p>
              </div>
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-slate-400">
              One connected trader identity across learning, journaling, AI, alerts, competition, community, tools, and funding.
            </p>
            <a href="mailto:support@tradehybrid.club" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Mail className="h-4 w-4" /> support@tradehybrid.club
            </a>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white">Products</p>
            <div className="mt-4 space-y-3">
              {productLinks.map(([label, href]) => <div key={label}><SmartLink href={href}>{label}</SmartLink></div>)}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white">Club</p>
            <div className="mt-4 space-y-3">
              <div><a href="#ecosystem" className="text-sm text-slate-400 hover:text-white">Ecosystem</a></div>
              <div><a href="#members" className="text-sm text-slate-400 hover:text-white">Member feedback</a></div>
              <div><a href="#membership" className="text-sm text-slate-400 hover:text-white">Membership</a></div>
              <div><a href="#contact" className="text-sm text-slate-400 hover:text-white">Contact</a></div>
              <div><Link to={CLUB_LINKS.about} className="text-sm text-slate-400 hover:text-white">About Us</Link></div>
              <div><Link to={CLUB_LINKS.login} className="text-sm text-slate-400 hover:text-white">Member login</Link></div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="max-w-5xl text-[11px] leading-5 text-slate-500">
            Trading and funded-account programs involve risk. Trade Hybrid software, community content, AI tools, education, and competition features do not guarantee trading results or profits. Members remain responsible for their own trading decisions and for understanding the rules of any broker, platform, or funding program they use.
          </p>
          <div className="mt-4 flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>© {new Date().getFullYear()} Trade Hybrid. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="transition hover:text-slate-300">Privacy Policy</Link>
              <Link to="/terms" className="transition hover:text-slate-300">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
