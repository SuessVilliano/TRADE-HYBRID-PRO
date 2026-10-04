import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import ClubFooter from '@/components/club/club-footer';

const sections = [
  {
    title: 'Information we collect',
    body: [
      'Account information you provide when you register: name or username, email address, and password (stored only in hashed form by our authentication provider).',
      'Membership and billing information processed through our payment provider (Whop). We do not store full payment card numbers on our servers.',
      'Trading-related data you choose to connect or import, such as journal entries, notes, alerts, and connected broker or platform identifiers.',
      'Usage data: pages visited, features used, device and browser information, and approximate location derived from IP address, used to operate and improve the Club.',
    ],
  },
  {
    title: 'How we use information',
    body: [
      'To create and manage your account, authenticate you, and provide the Club experience (community, Market Buddy AI, journal, alerts, education, events).',
      'To process memberships and verify entitlements through our payment provider.',
      'To personalize Market Buddy AI responses using the context you provide (your goals, journal entries, and preferences).',
      'To communicate with you about your account, membership, product updates, and community events.',
      'To detect abuse, protect the platform, and comply with legal obligations.',
    ],
  },
  {
    title: 'AI and your data',
    body: [
      'Market Buddy AI and related AI features process the information you provide in conversations and the Club context you have connected (such as journal summaries and goals) to generate responses.',
      'We do not sell your personal conversations or journal content. AI processing is performed to deliver the feature you requested.',
      'Do not share passwords, full account numbers, or other sensitive credentials in AI chats or community posts.',
    ],
  },
  {
    title: 'Sharing of information',
    body: [
      'Service providers who help us operate the Club: authentication (Supabase), payments and membership (Whop), hosting (Vercel), and AI model providers. Each processes data only as needed to provide its service.',
      'Connected third parties you choose to link (brokers, trading platforms, community tools) receive only the data required for the integration you authorized.',
      'Legal compliance: we may disclose information if required by law or to protect the rights, safety, and security of Trade Hybrid, our members, or others.',
      'We do not sell your personal information to advertisers or data brokers.',
    ],
  },
  {
    title: 'Cookies and tracking',
    body: [
      'We use essential cookies and browser storage for sign-in sessions, theme preferences, and security.',
      'We may use privacy-respecting analytics to understand aggregate usage and improve the Club. You can control cookies through your browser settings.',
    ],
  },
  {
    title: 'Data retention and security',
    body: [
      'We retain account and membership records while your account is active and as needed for legal, tax, and accounting purposes.',
      'You may request deletion of your account and personal data by contacting support@tradehybrid.club; some records may be retained where the law requires.',
      'We use industry-standard safeguards (encryption in transit, access controls, hashed passwords). No system is perfectly secure, so protect your own credentials and enable strong, unique passwords.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'Depending on where you live, you may have the right to access, correct, export, or delete your personal information, and to object to or restrict certain processing.',
      'To exercise these rights, email support@tradehybrid.club. We will respond within a reasonable timeframe.',
    ],
  },
  {
    title: 'Children',
    body: [
      'The Club is not intended for children under 18. We do not knowingly collect personal information from children under 18.',
    ],
  },
  {
    title: 'Changes to this policy',
    body: [
      'We may update this Privacy Policy as the Club evolves. Material changes will be communicated through the site or by email, and the "Last updated" date below will be revised.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-slate-950 dark:bg-[#070a12] dark:text-white">
      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-300 dark:hover:text-violet-200"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Trade Hybrid Club
        </Link>

        <div className="mt-8 flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 via-blue-500 to-cyan-500 text-white shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
              Legal
            </p>
            <h1 className="font-display mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
              Privacy Policy
            </h1>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Last updated: October 4, 2026
        </p>

        <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-300">
          Trade Hybrid Club ("we", "us", "our") respects your privacy. This policy explains what
          information we collect, how we use it, and the choices you have. By using the Club, you
          agree to the practices described here.
        </p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
                {section.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {section.body.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-400"
                  >
                    <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-cyan-500" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-violet-100 bg-violet-50/60 p-6 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Contact us</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Questions about this policy or your data? Email{' '}
            <a
              href="mailto:support@tradehybrid.club"
              className="font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-300"
            >
              support@tradehybrid.club
            </a>
            .
          </p>
        </div>
      </div>
      <ClubFooter />
    </main>
  );
}
