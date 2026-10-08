import React, { useEffect, useRef, useState } from 'react';
import { authService } from '@/lib/services/auth-service';
import { CLUB_LINKS } from '@/lib/club-links';
type Message = { role: 'user' | 'assistant'; content: string };
export function AITradeAssistant({ className = '' }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages,busy]);
  async function send(event?: React.FormEvent) {
    event?.preventDefault();
    if (busy || !input.trim()) return;
    const message = input.trim();
    const history = [...messages, { role: 'user' as const, content: message }];
    setMessages(history); setInput(''); setBusy(true); setError('');
    try {
      const token = await authService.getAccessToken();
      if (!token) throw new Error('Please sign in to continue.');
      const response = await fetch('/api/market-buddy/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ messages: history.slice(-12) }), signal: AbortSignal.timeout(45000) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.reply) throw new Error(body.error || 'Market Buddy is temporarily unavailable. Try again.');
      setMessages([...history, { role: 'assistant', content: body.reply }]);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to send message.'); setMessages(history.slice(0,-1)); setInput(message); }
    finally { setBusy(false); }
  }
  return <section className={'flex min-h-[500px] flex-col ' + className} aria-label="Market Buddy chat">
    <h2 className="text-xl font-bold">Chat with Market Buddy</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Use your Club game plan to work through goals, risk rules, and trade reviews. Chat history stays in this session.</p>
    <div role="log" aria-live="polite" className="my-4 flex max-h-[560px] min-h-[300px] flex-1 flex-col gap-4 overflow-y-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      {!messages.length && <div className="rounded-xl border border-violet-100 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"><p className="font-semibold">What would you like to work on?</p><p className="mt-2 text-sm text-slate-500">Try “Help me review my trading game plan” or “How should I prepare for tomorrow’s session?”</p></div>}
      {messages.map((m,i) => <div key={i} className={'max-w-[92%] whitespace-pre-wrap rounded-2xl p-4 text-sm leading-6 ' + (m.role === 'user' ? 'self-end bg-violet-600 text-white' : 'self-start border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900')}><p className="mb-1 text-xs font-bold opacity-70">{m.role === 'user' ? 'You' : 'Market Buddy'}</p>{m.content}</div>)}
      {busy && <p role="status" className="text-sm text-violet-600">Market Buddy is thinking…</p>}<div ref={bottom}/>
    </div>
    {error && <p role="alert" className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    <form onSubmit={send} className="flex items-end gap-2"><textarea aria-label="Message Market Buddy" maxLength={4000} value={input} disabled={busy} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter' && !e.shiftKey){e.preventDefault(); send();}}} placeholder="Ask about your plan, risk rules, or review…" className="min-h-20 flex-1 rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-900"/><button type="submit" disabled={busy || !input.trim()} className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-5 py-3 font-bold text-white disabled:opacity-50">Send</button></form>
    <p className="mt-3 text-xs text-slate-500">Voice trading is available in <a href={CLUB_LINKS.abatev} target="_blank" rel="noreferrer" className="font-semibold text-cyan-700 dark:text-cyan-300">ABATEV ↗</a>. Market Buddy cannot place orders or read unconnected broker accounts.</p>
  </section>;
}
