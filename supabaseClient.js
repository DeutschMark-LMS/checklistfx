/**
 * SUPABASE CLIENT & AUTH ENGINE
 * DMA Trading Checklist
 */

(function() {
  'use strict';

  const SUPABASE_URL = 'https://xknmlbksrsdxrxcowedc.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrbm1sYmtzcnNkeHJ4Y293ZWRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjY0MTAsImV4cCI6MjA5MDA0MjQxMH0.kwd14cseMe4XyjKooOS9WdoSHPXm0MpJTiqvHqR4N9s';

  let client = null;
  let isInitialized = false;

  function initClient() {
    if (isInitialized) return client;

    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            storage: window.localStorage
          }
        });
        isInitialized = true;
      } catch (err) {
        console.warn('[DMA Supabase] Failed to create client:', err);
      }
    } else {
      console.warn('[DMA Supabase] window.supabase not loaded from CDN yet.');
    }

    return client;
  }

  // Attempt initial client setup
  initClient();

  const DMA_AUTH = {
    get client() {
      return initClient();
    },

    /**
     * Sign Up with Email & Password
     */
    async signUp(param1, param2, param3) {
      let email, password, fullName;
      if (typeof param1 === 'object' && param1 !== null) {
        email = param1.email;
        password = param1.password;
        fullName = param1.fullName;
      } else {
        email = param1;
        password = param2;
        fullName = param3;
      }
      email = (email || '').trim();

      const sb = initClient();
      if (!sb) {
        // Fallback for demo / offline
        const mockUser = {
          id: 'local-' + Date.now(),
          email: email || 'trader@dma.com',
          user_metadata: { full_name: fullName || (email ? email.split('@')[0] : 'Trader') }
        };
        localStorage.setItem('checklist-auth', 'true');
        localStorage.setItem('dma_user', JSON.stringify(mockUser));
        localStorage.setItem('dma_active_user', JSON.stringify(mockUser));
        return { data: { user: mockUser, session: { access_token: 'local-token' } }, error: null };
      }

      try {
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || '',
              trading_style: 'Momentum + Breakout'
            }
          }
        });

        if (error) throw error;

        if (data && data.user) {
          localStorage.setItem('checklist-auth', 'true');
          localStorage.setItem('dma_user', JSON.stringify(data.user));
          localStorage.setItem('dma_active_user', JSON.stringify(data.user));
        }

        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },

    /**
     * Sign In with Email & Password
     */
    async signIn(param1, param2) {
      let email, password;
      if (typeof param1 === 'object' && param1 !== null) {
        email = param1.email;
        password = param1.password;
      } else {
        email = param1;
        password = param2;
      }
      email = (email || '').trim();

      const sb = initClient();
      if (!sb) {
        const mockUser = {
          id: 'local-' + Date.now(),
          email: email || 'trader@dma.com',
          user_metadata: { full_name: email ? email.split('@')[0] : 'Trader' }
        };
        localStorage.setItem('checklist-auth', 'true');
        localStorage.setItem('dma_user', JSON.stringify(mockUser));
        localStorage.setItem('dma_active_user', JSON.stringify(mockUser));
        return { data: { user: mockUser, session: { access_token: 'local-token' } }, error: null };
      }

      try {
        const { data, error } = await sb.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        if (data && data.user) {
          localStorage.setItem('checklist-auth', 'true');
          localStorage.setItem('dma_user', JSON.stringify(data.user));
          localStorage.setItem('dma_active_user', JSON.stringify(data.user));
        }

        return { data, error: null };
      } catch (err) {
        return { data: null, error: err };
      }
    },

    /**
     * Sign In / Sign Up with Google OAuth
     */
    async signInWithGoogle() {
      const sb = initClient();
      if (!sb) {
        alert('Supabase client is initializing. Please try again.');
        return;
      }

      try {
        const redirectUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/app.html');
        const { data, error } = await sb.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl
          }
        });

        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.error('[DMA Supabase] Google Auth Error:', err);
        return { data: null, error: err };
      }
    },

    /**
     * Sign Out
     */
    async signOut() {
      const sb = initClient();
      try {
        if (sb) {
          await sb.auth.signOut();
        }
      } catch (err) {
        console.warn('[DMA Supabase] Sign out error:', err);
      } finally {
        localStorage.removeItem('checklist-auth');
        localStorage.removeItem('dma_user');
        localStorage.removeItem('dma_active_user');
      }
    },

    /**
     * Get Current Active Session
     */
    async getSession() {
      const sb = initClient();
      if (!sb) {
        const isAuth = localStorage.getItem('checklist-auth') === 'true';
        const user = JSON.parse(localStorage.getItem('dma_user') || localStorage.getItem('dma_active_user') || 'null');
        return isAuth ? { session: { user } } : { session: null };
      }

      try {
        const { data: { session }, error } = await sb.auth.getSession();
        if (error) throw error;
        if (session && session.user) {
          localStorage.setItem('checklist-auth', 'true');
          localStorage.setItem('dma_user', JSON.stringify(session.user));
          localStorage.setItem('dma_active_user', JSON.stringify(session.user));
        }
        return { session };
      } catch (_) {
        const isAuth = localStorage.getItem('checklist-auth') === 'true';
        const user = JSON.parse(localStorage.getItem('dma_user') || localStorage.getItem('dma_active_user') || 'null');
        return isAuth ? { session: { user } } : { session: null };
      }
    },

    /**
     * Get Current User (Cached Synchronously, Updated Asynchronously)
     */
    getUser() {
      try {
        const u = localStorage.getItem('dma_user') || localStorage.getItem('dma_active_user');
        return u ? JSON.parse(u) : null;
      } catch (_) {
        return null;
      }
    },

    /**
     * Fetch Current User from Server
     */
    async fetchUser() {
      const sb = initClient();
      if (!sb) return this.getUser();
      try {
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
          localStorage.setItem('dma_user', JSON.stringify(user));
          localStorage.setItem('dma_active_user', JSON.stringify(user));
          return user;
        }
      } catch (_) {}
      return this.getUser();
    },

    /**
     * Send Password Reset Email
     */
    async resetPassword(email) {
      const sb = initClient();
      if (!sb) {
        return { error: new Error('Supabase client is not available.') };
      }

      try {
        const redirectUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, '/login.html');
        const { data, error } = await sb.auth.resetPasswordForEmail(email, {
          redirectTo: redirectUrl
        });
        return { data, error };
      } catch (err) {
        return { data: null, error: err };
      }
    },

    /**
     * Subscribe to Auth State Changes
     */
    onAuthStateChange(callback) {
      const sb = initClient();
      if (sb) {
        return sb.auth.onAuthStateChange(callback);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  };

  // Expose globally
  window.DMA_AUTH = DMA_AUTH;
})();
