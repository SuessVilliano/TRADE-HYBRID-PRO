import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import ClubFooter from '@/components/club/club-footer';

const sections = [
  {
    title: 'The Club and membership',
    body: [
      'Trade Hybrid Club is a membership community providing education, software tools (including Hybrid Journal, Market Buddy AI, and the ABATEV terminal), alerts, community access, events, and related content.',
      'Memberships are sold through our payment provider (Whop). By purchasing, you agree to Whop\'s checkout terms as well as these Terms.',
      'Monthly and yearly memberships renew automatically until cancelled. Lifetime tiers are one-time purchases. Cancel anytime from your membership settings; access continues until the end of the paid period.',
    ],
  },
  {
    title: 'Not financial advice — risk disclosure',
    body: [
      'Nothing in the Club — including Market Buddy AI responses, alerts, signals, journal analytics, community posts, education, or live sessions — is financial advice, a recommendation, or an offer to buy or sell any security or instrument.',
      'Trading stocks, options, futures, forex, and crypto involves substantial risk of loss and is not suitable for everyone. You can lose some or all of your capital. Past performance does not guarantee future results.',
      'You are solely responsible for your own trading decisions. Do your own research and consider consulting a licensed financial professional before trading.',
      'AI-generated content can be wrong, incomplete, or outdated. Always verify AI outputs against reliable sources before acting on them.',
    ],
  },
  {
    title: 'Acceptable use',
    body: [
      'Use the Club lawfully and respectfully. Do not harass members, post spam, or share content that is illegal, abusive, or infringes the rights of others.',
      'Do not attempt to disrupt the platform, scrape member data, reverse-engineer paid features to bypass membership, or share your login credentials with others.',
      'Do not share non-public personal data of other members. What is shared in member-only spaces stays in member-only spaces.',
      'We may suspend or terminate accounts that violate these Terms, abuse the community, or engage in fraud — with or without notice for serious violations.',
    ],
  },
  {
    title: 'Intellectual property',
    body: [
      'Club content, software, branding, course materials, and the Trade Hybrid name and logos are owned by us or our licensors and are protected by intellectual property laws.',
      'Your membership gives you a personal, non-transferable license to access and use the Club for your own trading education. You may not resell, redistribute, or publicly share paid content.',
      'Content you post (such as community messages or shared trade ideas) remains yours, and you grant us a license to display it within the Club as needed to operate the service.',
    ],
  },
  {
    title: 'Third-party services',
    body: [
      'The Club connects with third-party services (brokers, trading platforms, payment processors, AI providers). Your use of those services is governed by their own terms, and we are not responsible for their outages, data practices, or actions.',
      'Whop handles payment processing and enforces its own refund and dispute policies at checkout. Refund requests are handled according to the terms presented at purchase.',
    ],
  },
  {
    title: 'Disclaimers and limitation of liability',
    body: [
      'The Club is provided "as is" and "as available" without warranties of any kind, express or implied, including warranties of accuracy, reliability, or fitness for a particular purpose.',
      'To the maximum extent permitted by law, we are not liable for any trading losses, lost profits, or indirect, incidental, or consequential damages arising from your use of the Club.',
      'Our total liability for any claim related to the Club will not exceed the membership fees you paid in the twelve months before the claim arose.',
    ],
  },
  {
    title: 'Changes and contact',
    body: [
      'We may update these Terms as the Club evolves. Material changes will be communicated through the site or by email, and continued use after changes take effect constitutes acceptance.',
      'Questions about these Terms? Email support@tradehybrid.club.',
    ],
  },
];

export default function TermsOfServicePage() {
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
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
              Legal
            </p>
            <h1 className="font-display mt-1 text-4xl font-semibold tracking-tight sm:text-5xl">
              Terms of Service
            </h1>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Last updated: October 4, 2026
        </p>

        <p className="mt-6 text-base leading-7 text-slate-600 dark:text-slate-300">
          These Terms of Service ("Terms") govern your access to and use of Trade Hybrid Club. By
          creating an account or purchasing a membership, you agree to these Terms. If you do not
          agree, please do not use the Club.
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
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Risk reminder
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Trading involves risk. The Club exists to help you become a more disciplined, informed
            trader — it cannot remove the risk from the market. Never trade money you cannot afford
            to lose.
          </p>
        </div>
      </div>
      <ClubFooter />
    </main>
  );
}
