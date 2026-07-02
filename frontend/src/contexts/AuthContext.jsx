import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCsrfToken,
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin as logoutRequest,
  refreshSession,
  registerAdmin as registerRequest,
} from '../api/auth';
import { setCsrfToken } from '../api/client';
import { clearDiscordSetupSkip } from '../utils/discordSetup';
import { AuthContext } from './AuthContextObject';

const splitSessionPayload = (data) => {
  if (!data) {
    return { admin: null, csrfToken: null };
  }

  const { csrfToken, ...admin } = data;
  return { admin, csrfToken: csrfToken || null };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const response = await getCurrentAdmin();
      const { admin, csrfToken } = splitSessionPayload(response.data);
      setUser(admin);

      if (csrfToken) {
        setCsrfToken(csrfToken);
      } else {
        try {
          const csrfResponse = await getCsrfToken();
          setCsrfToken(csrfResponse.data.csrfToken);
        } catch {
          // Session is valid; CSRF can be fetched after cookie propagation.
        }
      }
    } catch {
      try {
        const refreshResponse = await refreshSession();
        const { admin, csrfToken } = splitSessionPayload(refreshResponse.data);
        setUser(admin);

        if (csrfToken) {
          setCsrfToken(csrfToken);
        } else {
          try {
            const csrfResponse = await getCsrfToken();
            setCsrfToken(csrfResponse.data.csrfToken);
          } catch {
            // Ignore — user may still browse read-only until next refresh.
          }
        }
      } catch {
        setUser(null);
      }
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const login = useCallback(async (payload) => {
    const response = await loginAdmin(payload);
    clearDiscordSetupSkip();
    const { admin, csrfToken } = splitSessionPayload(response.data);
    setUser(admin);

    if (csrfToken) {
      setCsrfToken(csrfToken);
    } else {
      try {
        const csrfResponse = await getCsrfToken();
        setCsrfToken(csrfResponse.data.csrfToken);
      } catch {
        // Login succeeded; CSRF will be required for mutating requests.
      }
    }

    return response;
  }, []);

  const register = useCallback(async (payload) => registerRequest(payload), []);

  const logout = useCallback(async () => {
    await logoutRequest();
    clearDiscordSetupSkip();
    setUser(null);
    setCsrfToken('');
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      register,
      logout,
      reloadSession: loadSession,
      updateUser: setUser,
    }),
    [isBootstrapping, loadSession, login, logout, register, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
