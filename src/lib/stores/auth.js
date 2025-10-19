import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Initial state (no token - it's in HTTP-only cookie)
const initialState = {
  isAuthenticated: false,
  user: null
};

// Load saved auth state from localStorage
function loadAuthState() {
  if (!browser) return initialState;

  try {
    const userStr = localStorage.getItem('authUser');

    if (userStr) {
      const user = JSON.parse(userStr);
      return {
        isAuthenticated: true,
        user
      };
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
  }

  return initialState;
}

// Create the store
function createAuthStore() {
  const { subscribe, set, update } = writable(loadAuthState());

  return {
    subscribe,
    login: (user) => {
      // Token is now in HTTP-only cookie, we only store user info
      if (browser) {
        localStorage.setItem('authUser', JSON.stringify(user));
      }

      set({
        isAuthenticated: true,
        user
      });
    },
    logout: () => {
      if (browser) {
        localStorage.removeItem('authUser');
      }

      set(initialState);
    },
    updateUser: (userData) => {
      update(state => {
        const updatedUser = { ...state.user, ...userData };

        if (browser) {
          localStorage.setItem('authUser', JSON.stringify(updatedUser));
        }

        return {
          ...state,
          user: updatedUser
        };
      });
    },
    checkAuth: () => {
      // Optional: Verify token with backend
      const state = loadAuthState();
      set(state);
      return state.isAuthenticated;
    }
  };
}

export const authStore = createAuthStore();
