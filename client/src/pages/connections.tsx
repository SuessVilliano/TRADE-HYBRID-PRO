import React from 'react';
import { Link } from 'react-router-dom';
import { CLUB_LINKS } from '@/lib/club-links';
import { useAuth } from '@/lib/context/AuthContext';
const apps = [
  ['Hybrid Journal','Broker imports, trade records, account analytics, and your trading workspace.',CLUB_LINKS.journal],
  ['Hybrid Copy','Master and follower accounts, copy rules, broker adapters, and execution logs.',CLUB_LINKS.copy],
  ['ABATEV','Terminal connections, bots, voice trading, and execution controls.',CLUB_LINKS.abatev],
  ['Academy','Courses, progress, exams, playbooks, and credentials using your Club identity.',CLUB_LINKS.academy],
] as const;
export default function ConnectionsPage() {
  const { currentUser } = useAuth();
  return <main className="min-h-screen bg-slate-50 p-4 text-slate-950 dark:bg-[#070b14] dark:text-white sm:p-8"><div className="mx-auto max-w-6xl"><h1 className="text-3xl font-black">Your ecosystem connections</h1><p className="mt-2 text-slate-500">Manage each connection in the app that owns it. Club keeps your identity, membership, and game plan together.</p><section className="my-6 rounded-2xl border border-cyan-100 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-bold">Trade Hybrid Club identity</h2><p className="mt-2">{currentUser?.email}</p><p className="mt-1 text-sm text-slate-500">{currentUser?.membershipLevel} membership · <Link to="/profile" className="text-violet-700 dark:text-violet-300">Account and billing</Link></p></section><div className="grid gap-4 sm:grid-cols-2">{apps.map(([name,description,href])=><section key={name} className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"><h2 className="text-xl font-bold">{name}</h2><p className="my-3 text-sm leading-6 text-slate-500">{description}</p><a href={href} target="_blank" rel="noreferrer" className="inline-block rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-4 py-2 font-bold text-white">Open {name} ↗</a></section>)}</div><p className="mt-6 text-sm text-slate-500">Broker connection status is shown inside each app. Legacy apps remain live during the migration; some still require their existing sign-in.</p></div></main>;
}
