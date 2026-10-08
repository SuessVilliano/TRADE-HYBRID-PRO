import { activeEntitlements } from '../active-entitlements';
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || 'https://uqtluroceakqtlvlzatt.supabase.co').replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_YjXHHnoRXE4pvn6ezLdU5w_O03Q62W_';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const CLUB_SITE_URL = (
  import.meta.env.VITE_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://pro.tradehybrid.co')
).replace(/\/$/, '');
const SESSION_KEY = 'trade-hybrid-club-auth';

type ClubSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  user?: any;
};

function authHeaders(accessToken?: string) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
}

function saveSession(session: ClubSession) {
  const expiresAt =
    session.expires_at ||
    (session.expires_in ? Math.floor(Date.now() / 1000) + session.expires_in : undefined);

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      ...session,
      expires_at: expiresAt,
    }),
  );
}

function readSession(): ClubSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

async function refreshSession(session: ClubSession): Promise<ClubSession | null> {
  if (!session.refresh_token) return null;

  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });

  if (!response.ok) {
    clearSession();
    return null;
  }

  const refreshed = await response.json();
  saveSession(refreshed);
  return refreshed;
}

function captureRedirectSession(): ClubSession | null {
  if (typeof window === 'undefined' || !window.location.hash) return null;

  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (!accessToken || !refreshToken) return null;

  const expiresIn = Number(params.get('expires_in') || 3600);
  const session: ClubSession = {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_in: expiresIn,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  };

  saveSession(session);

  // Remove tokens from the visible URL immediately after capturing them.
  window.history.replaceState(
    {},
    document.title,
    window.location.pathname + window.location.search,
  );

  return session;
}

async function getValidSession(): Promise<ClubSession | null> {
  let session = readSession() || captureRedirectSession();
  if (!session?.access_token) return null;

  const now = Math.floor(Date.now() / 1000);
  if (session.expires_at && session.expires_at <= now + 60) {
    session = await refreshSession(session);
  }

  return session;
}

async function fetchProfile(accessToken: string, userId: string) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,username,display_name,avatar_url,created_at,updated_at`,
    { headers: authHeaders(accessToken) },
  );

  if (!response.ok) return null;
  const rows = await response.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function fetchEntitlements(accessToken: string, userId: string) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/product_entitlements?user_id=eq.${encodeURIComponent(userId)}&select=product_key,status,source,starts_at,ends_at`,
    { headers: authHeaders(accessToken) },
  );

  if (!response.ok) return [];
  const rows = await response.json();
  return Array.isArray(rows) ? rows : [];
}

function membershipFromEntitlements(entitlements: any[]) {
  const active = activeEntitlements(entitlements);
  if (active.some((item) => item.product_key !== 'club_free')) return 'paid';
  return 'free';
}

async function mapSupabaseUser(user: any, accessToken: string) {
  const [profile, entitlements] = await Promise.all([
    fetchProfile(accessToken, user.id),
    fetchEntitlements(accessToken, user.id),
  ]);

  const mapped = {
    id: user.id,
    username:
      profile?.username ||
      user.user_metadata?.username ||
      user.email?.split('@')[0] ||
      'trader',
    email: user.email || '',
    profileImage: profile?.avatar_url || null,
    displayName: profile?.display_name || user.user_metadata?.display_name || null,
    createdAt: user.created_at || profile?.created_at || null,
    contact: user.user_metadata?.club_contact || {},
    authenticated: true as const,
    membershipLevel: membershipFromEntitlements(entitlements),
    entitlements: activeEntitlements(entitlements),
    balance: 0,
  };

  return mapped;
}

export const authService = {
  async updateContact(contact: Record<string, string>) {
    const session = await getValidSession();
    if (!session?.access_token) throw new Error('Please sign in again.');
    const allowed = ['fullName','phone','addressLine1','addressLine2','city','region','postalCode','country','timezone'];
    const clean = Object.fromEntries(allowed.map(key => [key, String(contact[key] || '').trim().slice(0,200)]));
    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, { method: 'PUT', headers: authHeaders(session.access_token), body: JSON.stringify({ data: { club_contact: clean } }) });
    if (!response.ok) throw new Error('Your contact details could not be saved. Please retry.');
    return mapSupabaseUser(await response.json(), session.access_token);
  },
  async getAccessToken() {
    const session = await getValidSession();
    return session?.access_token || null;
  },

  async getSessionUserId() {
    const session = await getValidSession();
    const sub = session?.access_token
      ? JSON.parse(atob(session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))).sub
      : null;
    return sub || session?.user?.id || null;
  },

  async login(identifier: string, password?: string) {
    if (!password) {
      throw new Error('Password is required');
    }

    if (!identifier.includes('@')) {
      throw new Error('Use the email address for your Trade Hybrid account.');
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        email: identifier.trim().toLowerCase(),
        password,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.msg || result?.error_description || result?.message || 'Login failed');
    }

    saveSession(result);
    return mapSupabaseUser(result.user, result.access_token);
  },

  async register(username: string, email: string, password: string) {
    const confirmRedirect = `${CLUB_SITE_URL}/login?confirmed=1`;
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/signup?redirect_to=${encodeURIComponent(confirmRedirect)}`,
      {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        data: {
          username: username.trim(),
          display_name: username.trim(),
        },
      }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result?.msg || result?.error_description || result?.message || 'Registration failed',
      );
    }

    if (!result.access_token) {
      return {
        success: true,
        requiresEmailConfirmation: true,
        user: {
          id: result.user?.id,
          username,
          email,
          authenticated: false,
          membershipLevel: 'free',
          balance: 0,
        },
      };
    }

    saveSession(result);
    const user = await mapSupabaseUser(result.user, result.access_token);

    return {
      success: true,
      requiresEmailConfirmation: false,
      user,
    };
  },

  async requestPasswordReset(email: string) {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      throw new Error('Please enter a valid email address.');
    }

    const resetRedirect = `${CLUB_SITE_URL}/login?reset=1`;
    const response = await fetch(
      `${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(resetRedirect)}`,
      {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ email: trimmed }),
      },
    );

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      throw new Error(
        result?.msg || result?.error_description || result?.message || 'Could not send the reset link. Please try again.',
      );
    }

    return { success: true };
  },

  async loginWithWhop(whopId: string) {
    if (!API_BASE_URL) {
      throw new Error('Whop sign-in is not enabled on the Club backend yet.');
    }

    const response = await fetch(`${API_BASE_URL}/api/whop/direct-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ whopId }),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result?.error || 'Whop login failed');
    }

    return result;
  },

  async loginWithDemo() {
    if (!import.meta.env.DEV) {
      throw new Error('Demo login is disabled in production.');
    }

    const demoUser = {
      id: 'demo',
      username: 'demo_user',
      email: 'demo@trade-hybrid.com',
      membershipLevel: 'demo',
      authenticated: true,
      isDemo: true,
      balance: 0,
    };

    localStorage.setItem('demoUser', JSON.stringify(demoUser));
    return demoUser;
  },

  async getCurrentUser() {
    const session = await getValidSession();
    if (!session?.access_token) {
      return { authenticated: false as const };
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: authHeaders(session.access_token),
    });

    if (!response.ok) {
      clearSession();
      return { authenticated: false as const };
    }

    const user = await response.json();
    return mapSupabaseUser(user, session.access_token);
  },

  async logout() {
    const session = readSession();

    if (session?.access_token) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: authHeaders(session.access_token),
        });
      } catch {
        // Local logout should still complete if the network request fails.
      }
    }

    localStorage.removeItem('demoUser');
    clearSession();
    return true;
  },

  isAuthenticated() {
    const session = readSession();
    return Boolean(session?.access_token && (!session.expires_at || session.expires_at > Date.now() / 1000));
  },
};
