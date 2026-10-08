import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '@/lib/hooks/useTheme';
import { useAudio } from '@/lib/stores/useAudio';
import { ClubAccount } from '@/pages/profile';
import { notificationService } from '@/lib/notifications';
import ConnectionsPage from '@/pages/connections';
const sections = ['account','interface','notifications','audio','integrations'] as const;
export function SettingsPanel() {
  const [params,setParams] = useSearchParams();
  const wanted = params.get('section') || 'account';
  const section = wanted === 'hooks' ? 'integrations' : sections.includes(wanted as any) ? wanted : 'interface';
  const { resolvedTheme,setTheme } = useTheme();
  const audio = useAudio();
  const [notifications,setNotifications] = useState(notificationService.getSettings());
  function updateNotifications(patch: Partial<typeof notifications>) { notificationService.updateSettings(patch);setNotifications(notificationService.getSettings()); }
  return <div className="text-slate-950 dark:text-white"><nav aria-label="Settings sections" className="mb-6 flex flex-wrap gap-2">{sections.map(s=><button key={s} type="button" aria-current={section===s?'page':undefined} onClick={()=>setParams({section:s})} className={'rounded-xl px-4 py-2 text-sm font-bold '+(section===s?'bg-violet-600 text-white':'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300')}>{s==='interface'?'Appearance':s.charAt(0).toUpperCase()+s.slice(1)}</button>)}</nav>
    {section==='account' && <ClubAccount/>}
    {section==='interface' && <section className="rounded-2xl border p-6"><h2 className="text-xl font-bold">Appearance & navigation</h2><p className="my-3 text-sm text-slate-500">Club starts in light mode on each visit. Change the theme for this visit.</p><div className="flex gap-3">{(['light','dark'] as const).map(t=><button key={t} type="button" aria-pressed={resolvedTheme===t} onClick={()=>setTheme(t)} className={'rounded-xl border px-5 py-3 font-bold '+(resolvedTheme===t?'border-violet-500 bg-violet-50 text-violet-800':'')}>{t==='light'?'Light mode':'Dark mode'}</button>)}</div><p className="mt-6 text-sm text-slate-500">Use the Club menu for your daily workspace and connected apps. News is directly below TH TV.</p><Link to="/dashboard" className="mt-3 inline-block font-semibold text-cyan-700 dark:text-cyan-300">Return to dashboard →</Link></section>}
    {section==='notifications' && <section className="rounded-2xl border p-6"><h2 className="text-xl font-bold">Signal notifications</h2><p className="my-3 text-sm text-slate-500">Notify you of newly received signals while the Signals page is open. Preferences are saved in this browser.</p><div className="space-y-4">{([['enabled','Enable signal notifications'],['sounds','Notification sounds'],['showDesktop','Desktop notifications']] as const).map(([key,label])=><label key={key} className="flex items-center gap-3"><input type="checkbox" checked={notifications[key]} onChange={e=>updateNotifications({[key]:e.target.checked})}/>{label}</label>)}</div><p className="mt-4 text-xs text-slate-500">Desktop permission: {typeof Notification === 'undefined' ? 'Unavailable in this browser' : Notification.permission}. Your browser may ask for permission when enabled.</p></section>}
    {section==='audio'  && <section className="rounded-2xl border p-6"><h2 className="text-xl font-bold">Club audio</h2><p className="my-3 text-sm text-slate-500">These controls affect the Club audio player during this visit.</p><label className="flex items-center gap-3"><input type="checkbox" checked={audio.isMuted} onChange={audio.toggleMute}/>Mute Club audio</label><label className="mt-5 block">Master volume: {audio.masterVolume}%<input aria-label="Master volume" type="range" min="0" max="100" value={audio.masterVolume} onChange={e=>audio.setMasterVolume(Number(e.target.value))} className="mt-2 block w-full"/></label><label className="mt-5 block">Music volume: {audio.musicVolume}%<input aria-label="Music volume" type="range" min="0" max="100" value={audio.musicVolume} onChange={e=>audio.setMusicVolume(Number(e.target.value))} className="mt-2 block w-full"/></label></section>}
    {section==='integrations' && <ConnectionsPage/>}
  </div>;
}
