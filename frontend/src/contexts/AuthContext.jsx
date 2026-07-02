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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const loadSession = useCallback(async () => {
    try {
      const response = await getCurrentAdmin();
      setUser(response.data);
      const csrfResponse = await getCsrfToken();
      setCsrfToken(csrfResponse.data.csrfToken);
    } catch {
      try {
        const refreshResponse = await refreshSession();
        setUser(refreshResponse.data);
        const csrfResponse = await getCsrfToken();
        setCsrfToken(csrfResponse.data.csrfToken);
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
    setUser(response.data);
    const csrfResponse = await getCsrfToken();
    setCsrfToken(csrfResponse.data.csrfToken);
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
