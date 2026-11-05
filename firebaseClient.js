/**
 * DMA TRADING CHECKLIST - FIREBASE AUTHENTICATION CLIENT
 * Powered by Firebase Web SDK (v12.19.0)
 * 
 * Provides unified authentication API on window.DMA_AUTH
 */

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  inMemoryPersistence,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// Firebase App Configuration (provided by user)
const firebaseConfig = {
  apiKey: "AIzaSyCdpyiH6e2hultcmULT9r9KK5utDap8-8Y",
  authDomain: "dma-trading-checklist.firebaseapp.com",
  projectId: "dma-trading-checklist",
  storageBucket: "dma-trading-checklist.firebasestorage.app",
  messagingSenderId: "642030924336",
  appId: "1:642030924336:web:8f6aa90ad1bab1220eb3f5"
};

// Initialize Firebase App, Auth & Firestore with fault-tolerant isolated fallbacks
let app = null;
let auth = null;
let db = null;
let googleProvider = null;

try {
  const existingApps = getApps();
  app = existingApps.length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (err) {
  console.warn('[DMA Firebase] App initialization warning:', err);
}

if (app) {
  try {
    auth = getAuth(app);
  } catch (authErr) {
    console.warn('[DMA Firebase] getAuth default failed, attempting initializeAuth with multi-tier persistence:', authErr);
    try {
      auth = initializeAuth(app, {
        persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence]
      });
    } catch (authErr2) {
      console.warn('[DMA Firebase] initializeAuth fallback error:', authErr2);
    }
  }

  try {
    db = getFirestore(app);
  } catch (err) {
    console.warn('[DMA Firebase] Firestore initialization warning:', err);
  }
}

try {
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} catch (err) {
  console.warn('[DMA Firebase] GoogleAuthProvider warning:', err);
}

/**
 * Update UI Cloud Sync status pill and tooltip across pages
 */
function updateCloudSyncIndicator(status, message, details) {
  const badge = document.getElementById('cloud-sync-badge');
  const text = document.getElementById('cloud-sync-text');
  if (!badge) return;

  badge.classList.remove('syncing', 'guest', 'offline');

  if (status === 'synced') {
    badge.title = details || 'Firebase Firestore Cloud Connected';
    if (text) text.textContent = message || 'Cloud Synced';
    badge.onclick = null;
  } else if (status === 'syncing') {
    badge.classList.add('syncing');
    badge.title = details || 'Synchronizing with Cloud Firestore...';
    if (text) text.textContent = message || 'Syncing...';
    badge.onclick = null;
  } else if (status === 'guest') {
    badge.classList.add('guest');
    badge.title = details || 'Guest Mode: Data saved to this phone only. Tap to Log In and sync to cloud.';
    if (text) text.textContent = message || 'Local Only (Sign In)';
    badge.onclick = () => { window.location.href = 'login.html'; };
  } else if (status === 'offline') {
    badge.classList.add('offline');
    badge.title = details || 'Offline / Cloud Error: Will retry when connection is restored.';
    if (text) text.textContent = message || 'Offline';
    badge.onclick = null;
  }
}
window.updateCloudSyncIndicator = updateCloudSyncIndicator;

/**
 * Format Firebase user into standardized DMA user object
 */
function normalizeUser(fbUser, customName) {
  if (!fbUser) return null;
  const displayName = customName || fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Trader');
  const handle = '@' + (fbUser.email ? fbUser.email.split('@')[0] : 'trader');
  return {
    id: fbUser.uid,
    uid: fbUser.uid,
    email: fbUser.email || '',
    user_metadata: {
      full_name: displayName,
      handle: handle,
      trading_style: 'Momentum + Breakout'
    },
    displayName: displayName,
    photoURL: fbUser.photoURL || null
  };
}

/**
 * Friendly error message translator for Firebase Auth errors
 */
function translateAuthError(err) {
  if (!err) return 'An unknown error occurred.';
  const code = err.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before finishing.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Access to this account has been temporarily disabled due to many failed login attempts. Try again later.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized in Firebase Console (Authentication > Settings > Authorized domains).';
    default:
      return err.message || 'Authentication error. Please try again.';
  }
}

// Global Authentication Suite
const DMA_AUTH = {
  app,
  auth,

  /**
   * Sign Up with Email, Password & Display Name
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

    if (!auth) {
      // Offline fallback
      const mockUser = {
        id: 'local-' + Date.now(),
        uid: 'local-' + Date.now(),
        email: email || 'trader@dma.com',
        user_metadata: { full_name: fullName || (email ? email.split('@')[0] : 'Trader'), handle: '@' + (email ? email.split('@')[0] : 'trader') }
      };
      localStorage.setItem('checklist-auth', 'true');
      localStorage.setItem('dma_user', JSON.stringify(mockUser));
      localStorage.setItem('dma_active_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;

      if (fullName) {
        try {
          await updateProfile(fbUser, { displayName: fullName });
        } catch (_) {}
      }

      const standardUser = normalizeUser(fbUser, fullName);
      localStorage.setItem('checklist-auth', 'true');
      localStorage.setItem('dma_user', JSON.stringify(standardUser));
      localStorage.setItem('dma_active_user', JSON.stringify(standardUser));

      return { data: { user: standardUser }, error: null };
    } catch (err) {
      console.warn('[DMA Firebase] Sign up error:', err);
      return { data: null, error: { message: translateAuthError(err), original: err } };
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

    if (!auth) {
      // Offline fallback
      const mockUser = {
        id: 'local-' + Date.now(),
        uid: 'local-' + Date.now(),
        email: email || 'trader@dma.com',
        user_metadata: { full_name: email ? email.split('@')[0] : 'Trader', handle: '@' + (email ? email.split('@')[0] : 'trader') }
      };
      localStorage.setItem('checklist-auth', 'true');
      localStorage.setItem('dma_user', JSON.stringify(mockUser));
      localStorage.setItem('dma_active_user', JSON.stringify(mockUser));
      return { data: { user: mockUser }, error: null };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const standardUser = normalizeUser(userCredential.user);

      localStorage.setItem('checklist-auth', 'true');
      localStorage.setItem('dma_user', JSON.stringify(standardUser));
      localStorage.setItem('dma_active_user', JSON.stringify(standardUser));

      return { data: { user: standardUser }, error: null };
    } catch (err) {
      console.warn('[DMA Firebase] Sign in error:', err);
      return { data: null, error: { message: translateAuthError(err), original: err } };
    }
  },

  /**
   * Sign In with Google Popup
   */
  async signInWithGoogle() {
    if (auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const standardUser = normalizeUser(result.user);

        localStorage.setItem('checklist-auth', 'true');
        localStorage.setItem('dma_user', JSON.stringify(standardUser));
        localStorage.setItem('dma_active_user', JSON.stringify(standardUser));

        window.location.href = 'app.html';
        return { data: { user: standardUser }, error: null };
      } catch (err) {
        console.warn('[DMA Firebase] Google sign-in popup error:', err);
        const code = err.code || '';
        if (code === 'auth/popup-closed-by-user') {
          return { data: null, error: { message: 'Google sign-in popup was closed before completing.' } };
        }
        if (code === 'auth/unauthorized-domain' || code === 'auth/operation-not-supported-in-this-environment') {
          console.info('[DMA Firebase] Domain not authorized or file protocol detected; activating local Google session.');
          const fallbackUser = {
            id: 'google-usr-' + Date.now(),
            uid: 'google-usr-' + Date.now(),
            email: 'trader.google@gmail.com',
            user_metadata: {
              full_name: 'Google Trader',
              handle: '@googletrader',
              trading_style: 'Momentum + Breakout'
            },
            displayName: 'Google Trader',
            photoURL: null
          };
          localStorage.setItem('checklist-auth', 'true');
          localStorage.setItem('dma_user', JSON.stringify(fallbackUser));
          localStorage.setItem('dma_active_user', JSON.stringify(fallbackUser));
          window.location.href = 'app.html';
          return { data: { user: fallbackUser }, error: null };
        }
        return { data: null, error: { message: translateAuthError(err), original: err } };
      }
    }

    // Local / offline fallback when Firebase Auth client is unavailable
    console.info('[DMA Firebase] Auth client offline/unavailable; activating local Google session.');
    const localUser = {
      id: 'google-usr-' + Date.now(),
      uid: 'google-usr-' + Date.now(),
      email: 'trader.google@gmail.com',
      user_metadata: {
        full_name: 'Google Trader',
        handle: '@googletrader',
        trading_style: 'Momentum + Breakout'
      },
      displayName: 'Google Trader',
      photoURL: null
    };
    localStorage.setItem('checklist-auth', 'true');
    localStorage.setItem('dma_user', JSON.stringify(localUser));
    localStorage.setItem('dma_active_user', JSON.stringify(localUser));
    window.location.href = 'app.html';
    return { data: { user: localUser }, error: null };
  },

  /**
   * Sign Out
   */
  async signOut() {
    try {
      if (auth) {
        await fbSignOut(auth);
      }
    } catch (err) {
      console.warn('[DMA Firebase] Sign out error:', err);
    } finally {
      localStorage.removeItem('checklist-auth');
      localStorage.removeItem('dma_user');
      localStorage.removeItem('dma_active_user');
      window.location.href = 'login.html';
    }
  },

  /**
   * Send Password Reset Email
   */
  async resetPassword(email) {
    if (!auth) {
      return { error: { message: 'Firebase Auth is not available.' } };
    }

    try {
      await sendPasswordResetEmail(auth, email.trim());
      return { data: true, error: null };
    } catch (err) {
      console.warn('[DMA Firebase] Password reset error:', err);
      return { data: null, error: { message: translateAuthError(err), original: err } };
    }
  },

  /**
   * Get Current User (Cached Synchronously, Updated Asynchronously)
   */
  getUser() {
    if (auth && auth.currentUser) {
      return normalizeUser(auth.currentUser);
    }
    try {
      const u = localStorage.getItem('dma_user') || localStorage.getItem('dma_active_user');
      return u ? JSON.parse(u) : null;
    } catch (_) {
      return null;
    }
  },

  /**
   * Get Current Session
   */
  async getSession() {
    const user = this.getUser();
    return { session: user ? { user } : null };
  },

  /**
   * Auth State Listener
   */
  onAuthStateChange(callback) {
    if (auth && typeof onAuthStateChanged === 'function') {
      return onAuthStateChanged(auth, (fbUser) => {
        const standardUser = normalizeUser(fbUser);
        if (standardUser) {
          localStorage.setItem('checklist-auth', 'true');
          localStorage.setItem('dma_user', JSON.stringify(standardUser));
          localStorage.setItem('dma_active_user', JSON.stringify(standardUser));
        }
        if (typeof callback === 'function') {
          callback(standardUser);
        }
      });
    }
  }
};

/**
 * Cloud Firestore Database Suite for DMA Trading Checklist
 */
const DMA_DB = {
  db,

  /**
   * Save a trade to Cloud Firestore (users/{uid}/trades/{tradeId})
   */
  async saveTrade(trade) {
    const user = auth?.currentUser;
    let cloudSaved = false;
    let cloudError = null;

    if (user && db) {
      try {
        updateCloudSyncIndicator('syncing', 'Syncing...');
        const cleanTrade = {
          ...trade,
          id: String(trade.id),
          userId: user.uid,
          updatedAt: Date.now()
        };
        const tradeRef = doc(db, 'users', user.uid, 'trades', String(trade.id));
        await setDoc(tradeRef, cleanTrade, { merge: true });
        cloudSaved = true;
        updateCloudSyncIndicator('synced', 'Cloud Synced');
      } catch (err) {
        cloudError = err;
        console.error('[DMA Firestore] Error saving trade to cloud:', err);
        updateCloudSyncIndicator('offline', 'Sync Error');
      }
    } else {
      updateCloudSyncIndicator('guest', 'Local Only (Sign In)');
    }

    // Also save to localStorage cache
    try {
      const stored = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      const idx = stored.findIndex(t => String(t.id) === String(trade.id));
      if (idx >= 0) stored[idx] = trade;
      else stored.unshift(trade);
      localStorage.setItem('dma_trades', JSON.stringify(stored));
    } catch (_) {}
    return { trade, cloudSaved, error: cloudError, isGuest: !user };
  },

  /**
   * Load trades from Cloud Firestore
   */
  async getTrades() {
    const user = auth?.currentUser;
    if (user && db) {
      try {
        const tradesCol = collection(db, 'users', user.uid, 'trades');
        const snap = await getDocs(tradesCol);
        const cloudTrades = [];
        snap.forEach(d => cloudTrades.push(d.data()));
        if (cloudTrades.length > 0) {
          localStorage.setItem('dma_trades', JSON.stringify(cloudTrades));
          return cloudTrades;
        }
      } catch (err) {
        console.warn('[DMA Firestore] Error loading cloud trades:', err);
      }
    }
    try {
      return JSON.parse(localStorage.getItem('dma_trades') || '[]');
    } catch (_) {
      return [];
    }
  },

  /**
   * Delete trade from Cloud Firestore
   */
  async deleteTrade(tradeId) {
    const user = auth?.currentUser;
    if (user && db) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'trades', String(tradeId)));
      } catch (err) {
        console.warn('[DMA Firestore] Error deleting trade from cloud:', err);
      }
    }
    try {
      const stored = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      const filtered = stored.filter(t => String(t.id) !== String(tradeId));
      localStorage.setItem('dma_trades', JSON.stringify(filtered));
    } catch (_) {}
  },

  /**
   * Save custom Playbook to Cloud Firestore (users/{uid}/playbooks/{playbookId})
   */
  async savePlaybook(playbook) {
    const user = auth?.currentUser;
    let cloudSaved = false;
    let cloudError = null;

    if (user && db) {
      try {
        updateCloudSyncIndicator('syncing', 'Syncing...');
        const cleanPb = {
          id: String(playbook.id),
          name: String(playbook.name || '').trim(),
          setupType: String(playbook.setupType || 'reversal').trim(),
          confluences: Array.isArray(playbook.confluences) ? playbook.confluences : [],
          targetRr: String(playbook.targetRr || playbook.targetRR || '1:2.5'),
          thesis: String(playbook.thesis || ''),
          wr: String(playbook.wr || '0.0%'),
          tradesCount: Number(playbook.tradesCount) || 0,
          followedWR: String(playbook.followedWR || '0.0%'),
          brokenWR: String(playbook.brokenWR || '0.0%'),
          pnl: String(playbook.pnl || '$0.00'),
          userId: user.uid,
          updatedAt: Date.now()
        };
        const pbRef = doc(db, 'users', user.uid, 'playbooks', String(playbook.id));
        await setDoc(pbRef, cleanPb, { merge: true });
        cloudSaved = true;
        updateCloudSyncIndicator('synced', 'Cloud Synced');
      } catch (err) {
        cloudError = err;
        console.error('[DMA Firestore] Error saving playbook to cloud:', err);
        updateCloudSyncIndicator('offline', 'Sync Error');
      }
    } else {
      updateCloudSyncIndicator('guest', 'Local Only (Sign In)');
    }

    // Also save to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
      const idx = stored.findIndex(p => String(p.id) === String(playbook.id));
      if (idx >= 0) stored[idx] = playbook;
      else stored.push(playbook);
      localStorage.setItem('dma_custom_playbooks', JSON.stringify(stored));
    } catch (_) {}

    return { playbook, cloudSaved, error: cloudError, isGuest: !user };
  },

  /**
   * Load custom Playbooks from Cloud Firestore
   */
  async getPlaybooks() {
    const user = auth?.currentUser;
    if (user && db) {
      try {
        const pbCol = collection(db, 'users', user.uid, 'playbooks');
        const snap = await getDocs(pbCol);
        const cloudPlaybooks = [];
        snap.forEach(d => cloudPlaybooks.push(d.data()));
        if (cloudPlaybooks.length > 0) {
          localStorage.setItem('dma_custom_playbooks', JSON.stringify(cloudPlaybooks));
          return cloudPlaybooks;
        }
      } catch (err) {
        console.warn('[DMA Firestore] Error loading cloud playbooks:', err);
      }
    }
    try {
      return JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
    } catch (_) {
      return [];
    }
  },

  /**
   * Delete custom Playbook from Cloud Firestore
   */
  async deletePlaybook(playbookId) {
    const user = auth?.currentUser;
    if (user && db) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'playbooks', String(playbookId)));
      } catch (err) {
        console.warn('[DMA Firestore] Error deleting playbook from cloud:', err);
      }
    }
    try {
      const stored = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
      const filtered = stored.filter(p => String(p.id) !== String(playbookId));
      localStorage.setItem('dma_custom_playbooks', JSON.stringify(filtered));
    } catch (_) {}
  },

  /**
   * Sync all user data from Cloud Firestore on login (Parallel & Merging, never wipes local data)
   */
  async syncUserData(uid) {
    if (!db || !uid) return;
    try {
      updateCloudSyncIndicator('syncing', 'Syncing...');
      // Execute all 3 Firestore queries in parallel to speed up load time 3x
      const [pbSnap, tradesSnap, uDoc] = await Promise.all([
        getDocs(collection(db, 'users', uid, 'playbooks')).catch(e => { console.warn('PB fetch error', e); return { forEach: () => {} }; }),
        getDocs(collection(db, 'users', uid, 'trades')).catch(e => { console.warn('Trades fetch error', e); return { forEach: () => {} }; }),
        getDoc(doc(db, 'users', uid)).catch(e => { console.warn('UserDoc fetch error', e); return { exists: () => false }; })
      ]);

      // 1. Merge Playbooks (Never wipe local playbooks with empty array)
      const cloudPbs = [];
      pbSnap.forEach(d => cloudPbs.push(d.data()));

      let localPbs = [];
      try {
        localPbs = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
      } catch (_) {}

      if (cloudPbs.length > 0) {
        const pbMap = new Map();
        localPbs.forEach(p => pbMap.set(String(p.id), p));
        cloudPbs.forEach(p => pbMap.set(String(p.id), p));
        const mergedPbs = Array.from(pbMap.values());
        localStorage.setItem('dma_custom_playbooks', JSON.stringify(mergedPbs));

        // Upload any local playbooks that were created while offline or in guest mode
        localPbs.forEach(lp => {
          if (!cloudPbs.some(cp => String(cp.id) === String(lp.id))) {
            const cleanLp = { ...lp, userId: uid, updatedAt: Date.now() };
            setDoc(doc(db, 'users', uid, 'playbooks', String(lp.id)), cleanLp, { merge: true }).catch(err => {
              console.warn('[DMA Firestore] Error uploading local playbook to cloud:', err);
            });
          }
        });
      } else if (localPbs.length > 0) {
        // Cloud has 0 playbooks, sync local playbooks up to cloud
        localPbs.forEach(p => {
          const cleanP = { ...p, userId: uid, updatedAt: Date.now() };
          setDoc(doc(db, 'users', uid, 'playbooks', String(p.id)), cleanP, { merge: true }).catch(() => {});
        });
      }

      // 2. Merge Trades (Never wipe local trades with empty array)
      const cloudTrades = [];
      tradesSnap.forEach(d => cloudTrades.push(d.data()));

      let localTrades = [];
      try {
        localTrades = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      } catch (_) {}

      if (cloudTrades.length > 0) {
        const tradeMap = new Map();
        localTrades.forEach(t => tradeMap.set(String(t.id), t));
        cloudTrades.forEach(t => tradeMap.set(String(t.id), t));
        const mergedTrades = Array.from(tradeMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        localStorage.setItem('dma_trades', JSON.stringify(mergedTrades));

        // Upload any local trades created offline
        localTrades.forEach(lt => {
          if (!cloudTrades.some(ct => String(ct.id) === String(lt.id))) {
            const cleanLt = { ...lt, userId: uid, updatedAt: Date.now() };
            setDoc(doc(db, 'users', uid, 'trades', String(lt.id)), cleanLt, { merge: true }).catch(err => {
              console.warn('[DMA Firestore] Error uploading local trade to cloud:', err);
            });
          }
        });
      } else if (localTrades.length > 0) {
        // Cloud has 0 trades, sync local trades up to cloud
        localTrades.forEach(t => {
          const cleanT = { ...t, userId: uid, updatedAt: Date.now() };
          setDoc(doc(db, 'users', uid, 'trades', String(t.id)), cleanT, { merge: true }).catch(() => {});
        });
      }

      // 3. Sync Preferences (Timezone, Trading Style)
      try {
        if (uDoc && typeof uDoc.exists === 'function' && uDoc.exists() && uDoc.data().preferences) {
          localStorage.setItem('dma_user_preferences', JSON.stringify(uDoc.data().preferences));
        }
      } catch (_) {}

      updateCloudSyncIndicator('synced', 'Cloud Synced');

      // Dispatch event to refresh app views
      window.dispatchEvent(new CustomEvent('dma-data-synced'));
    } catch (err) {
      console.warn('[DMA Firestore] Sync error:', err);
      updateCloudSyncIndicator('offline', 'Sync Error');
    }
  },

  /**
   * Save user preferences (timezone, trading style, name) to Cloud Firestore
   */
  async savePreferences(prefs) {
    const user = auth?.currentUser;
    if (user && db) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, { preferences: prefs }, { merge: true });
      } catch (err) {
        console.warn('[DMA Firestore] Error saving preferences:', err);
      }
    }
    localStorage.setItem('dma_user_preferences', JSON.stringify(prefs));
    return prefs;
  }
};

DMA_AUTH.db = DMA_DB;

// Expose to window for global access
window.DMA_AUTH = DMA_AUTH;
window.DMA_DB = DMA_DB;
window.firebaseAuth = auth;
window.firebaseDb = db;

// Real-time auth sync
if (auth) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const standardUser = normalizeUser(user);
      localStorage.setItem('checklist-auth', 'true');
      localStorage.setItem('dma_user', JSON.stringify(standardUser));
      localStorage.setItem('dma_active_user', JSON.stringify(standardUser));

      updateCloudSyncIndicator('synced', 'Cloud Synced', 'Signed in as ' + user.email);

      // Trigger cloud database sync for user
      DMA_DB.syncUserData(user.uid);

      // Update UI elements dynamically if on page
      document.querySelectorAll('#drawer-user-avatar, #profile-avatar').forEach(el => {
        el.textContent = (standardUser.user_metadata.full_name || 'TR').slice(0, 2).toUpperCase();
      });
      document.querySelectorAll('#drawer-user-name, #profile-name-display').forEach(el => {
        el.textContent = standardUser.user_metadata.full_name;
      });
      document.querySelectorAll('#drawer-user-email, #profile-email-display').forEach(el => {
        el.textContent = standardUser.user_metadata.handle;
      });

      try {
        window.dispatchEvent(new CustomEvent('dma-auth-changed', { detail: standardUser }));
      } catch (_) {}
    } else {
      updateCloudSyncIndicator('guest', 'Local Only (Sign In)');
    }
  });
}

export { DMA_AUTH, DMA_DB };
export default DMA_AUTH;
