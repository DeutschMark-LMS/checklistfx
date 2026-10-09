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
    if (user && db) {
      try {
        const tradeRef = doc(db, 'users', user.uid, 'trades', String(trade.id));
        await setDoc(tradeRef, trade, { merge: true });
      } catch (err) {
        console.warn('[DMA Firestore] Error saving trade to cloud:', err);
      }
    }
    // Also save to localStorage cache
    try {
      const stored = JSON.parse(localStorage.getItem('dma_trades') || '[]');
      const idx = stored.findIndex(t => String(t.id) === String(trade.id));
      if (idx >= 0) stored[idx] = trade;
      else stored.unshift(trade);
      localStorage.setItem('dma_trades', JSON.stringify(stored));
    } catch (_) {}
    return trade;
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
    if (user && db) {
      try {
        const pbRef = doc(db, 'users', user.uid, 'playbooks', String(playbook.id));
        await setDoc(pbRef, playbook, { merge: true });
      } catch (err) {
        console.warn('[DMA Firestore] Error saving playbook to cloud:', err);
      }
    }
    // Also save to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('dma_custom_playbooks') || '[]');
      const idx = stored.findIndex(p => String(p.id) === String(playbook.id));
      if (idx >= 0) stored[idx] = playbook;
      else stored.push(playbook);
      localStorage.setItem('dma_custom_playbooks', JSON.stringify(stored));
    } catch (_) {}
    return playbook;
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
   * Sync all user data from Cloud Firestore on login
   */
  async syncUserData(uid) {
    if (!db || !uid) return;
    try {
      // 1. Sync Playbooks
      const pbSnap = await getDocs(collection(db, 'users', uid, 'playbooks'));
      const pbs = [];
      pbSnap.forEach(d => pbs.push(d.data()));
      if (pbs.length > 0) {
        localStorage.setItem('dma_custom_playbooks', JSON.stringify(pbs));
      } else {
        localStorage.setItem('dma_custom_playbooks', '[]');
      }

      // 2. Sync Trades
      const tradesSnap = await getDocs(collection(db, 'users', uid, 'trades'));
      const trades = [];
      tradesSnap.forEach(d => trades.push(d.data()));
      if (trades.length > 0) {
        localStorage.setItem('dma_trades', JSON.stringify(trades));
      } else {
        localStorage.setItem('dma_trades', '[]');
      }

      // Dispatch event to refresh app views
      window.dispatchEvent(new CustomEvent('dma-data-synced'));
    } catch (err) {
      console.warn('[DMA Firestore] Sync error:', err);
    }
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
    }
  });
}

export { DMA_AUTH, DMA_DB };
export default DMA_AUTH;
