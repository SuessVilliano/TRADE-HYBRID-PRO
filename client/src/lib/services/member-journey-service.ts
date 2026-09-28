import { authService } from './auth-service';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://uqtluroceakqtlvlzatt.supabase.co').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_';

export type MemberOnboarding = {
  user_id: string;
  why_text?: string | null;
  primary_goal?: string | null;
  goal_30_days?: string | null;
  goal_90_days?: string | null;
  goal_1_year?: string | null;
  experience_level?: string | null;
  preferred_markets?: string[];
  current_challenges?: string[];
  weekly_hours?: number | null;
  preferred_learning_style?: string | null;
  onboarding_session_requested?: boolean;
  onboarding_session_at?: string | null;
  plan_summary?: Record<string, any>;
  current_stage?: 'welcome' | '72h' | '7d' | '15d' | '30d' | 'complete';
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type MemberAccessItem = {
  user_id: string;
  product_key: string;
  entitled: boolean;
  first_accessed_at?: string | null;
  last_accessed_at?: string | null;
  access_count: number;
  verified_at?: string | null;
};

async function sessionContext() {
  const accessToken = await authService.getAccessToken();
  const user = await authService.getCurrentUser();
  if (!accessToken || !user?.authenticated || !user?.id) {
    throw new Error('Your Trade Hybrid session has expired. Please sign in again.');
  }
  return { accessToken, userId: String(user.id), user };
}

function headers(accessToken: string, extra: Record<string, string> = {}) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export const memberJourneyService = {
  async getOnboarding(): Promise<MemberOnboarding | null> {
    const { accessToken, userId } = await sessionContext();
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/member_onboarding?user_id=eq.${encodeURIComponent(userId)}&select=*`,
      { headers: headers(accessToken) },
    );
    if (!response.ok) throw new Error('Could not load your onboarding journey.');
    const rows = await response.json();
    return Array.isArray(rows) ? rows[0] || null : null;
  },

  async saveOnboarding(patch: Partial<MemberOnboarding>): Promise<MemberOnboarding> {
    const { accessToken, userId } = await sessionContext();
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/member_onboarding?user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: 'PATCH',
        headers: headers(accessToken, { Prefer: 'return=representation' }),
        body: JSON.stringify({
          ...patch,
          updated_at: new Date().toISOString(),
        }),
      },
    );
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || 'Could not save your onboarding journey.');
    }
    const rows = await response.json();
    if (!rows?.[0]) throw new Error('Onboarding record was not returned.');
    return rows[0];
  },

  async getAccessChecklist(): Promise<MemberAccessItem[]> {
    const { accessToken, userId } = await sessionContext();
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/member_access_checklist?user_id=eq.${encodeURIComponent(userId)}&select=*&order=product_key.asc`,
      { headers: headers(accessToken) },
    );
    if (!response.ok) throw new Error('Could not load your access checklist.');
    return await response.json();
  },

  async markAccess(productKey: string, entitled = true) {
    const { accessToken } = await sessionContext();
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/rpc/record_member_product_access`,
      {
        method: 'POST',
        headers: headers(accessToken),
        body: JSON.stringify({ p_product_key: productKey }),
      },
    );
    if (!response.ok) throw new Error('Could not update product access.');
    return await response.json();
  },

  async getLifecycleMessages() {
    const { accessToken, userId } = await sessionContext();
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/member_lifecycle_messages?user_id=eq.${encodeURIComponent(userId)}&select=milestone,scheduled_for,status,template_key,sent_at&order=scheduled_for.asc`,
      { headers: headers(accessToken) },
    );
    if (!response.ok) throw new Error('Could not load lifecycle milestones.');
    return await response.json();
  },
};

export default memberJourneyService;
