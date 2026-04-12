import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuthResponse } from '../../types';

const AUTH_STORAGE_KEY = 'authState';
const REFRESH_TOKEN_KEY = 'refreshToken';

interface PersistedAuthState {
  user: { userId: number; email: string; role: string } | null;
  accessToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
}

const loadPersistedAuthState = (): PersistedAuthState => {
  if (typeof window === 'undefined') {
    return {
      user: null,
      accessToken: null,
      role: null,
      isAuthenticated: false,
    };
  }

  try {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return {
        user: null,
        accessToken: null,
        role: null,
        isAuthenticated: false,
      };
    }

    const parsedValue = JSON.parse(rawValue) as PersistedAuthState;
    return {
      user: parsedValue.user ?? null,
      accessToken: parsedValue.accessToken ?? null,
      role: parsedValue.role ?? null,
      isAuthenticated: Boolean(parsedValue.isAuthenticated && parsedValue.accessToken),
    };
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    return {
      user: null,
      accessToken: null,
      role: null,
      isAuthenticated: false,
    };
  }
};

interface AuthState {
  user: { userId: number; email: string; role: string } | null;
  accessToken: string | null;
  role: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  ...loadPersistedAuthState(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<AuthResponse>) {
      const { accessToken, refreshToken, userId, email, role } = action.payload;
      state.accessToken = accessToken;
      state.user = { userId, email, role };
      state.role = role;
      state.isAuthenticated = true;
      state.error = null;
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user: state.user,
          accessToken,
          role,
          isAuthenticated: true,
        })
      );
      localStorage.setItem('refreshToken', refreshToken);
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.role = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('refreshToken');
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setCredentials, logout, setLoading, setError } = authSlice.actions;
export default authSlice.reducer;
