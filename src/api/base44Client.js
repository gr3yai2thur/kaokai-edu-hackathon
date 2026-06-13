// Local auth — replaces @base44/sdk
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } },
  setSession: (user) => {
    localStorage.setItem(TOKEN_KEY, btoa(JSON.stringify({ id: user.user_id, exp: Date.now() + 86400000 * 7 })));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return false;
      const { exp } = JSON.parse(atob(token));
      return Date.now() < exp;
    } catch { return false; }
  },
};

// Stub — kept for files that still import base44 directly (will be removed after refactor)
export const base44 = { auth };
