import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null
};

// Load saved auth state from localStorage
function loadAuthState() {
  if (!browser) return initialState;

  try {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('authUser');

    if (token && userStr) {
      const user = JSON.parse(userStr);
      return {
        isAuthenticated: true,
        user,
        token
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
    login: (token, user) => {
      if (browser) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(user));
      }

      set({
        isAuthenticated: true,
        user,
        token
      });
    },
    logout: () => {
      if (browser) {
        localStorage.removeItem('authToken');
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
