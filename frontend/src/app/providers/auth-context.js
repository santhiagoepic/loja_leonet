"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createHttpClient } from "../../lib/httpClient";

const AuthContext = createContext(null);

const STORAGE_KEY = "leoneth.auth.tokens";
const LEGACY_STORAGE_KEY = ["leone", "t.auth.tokens"].join("");
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const CLIENT_PREFIX = "/api/client";
const CLIENT_AUTH_PREFIX = `${CLIENT_PREFIX}/auth`;

export function AuthProvider({ children }) {
  const [tokens, setTokens] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistTokens = useCallback((nextTokens) => {
    setTokens(nextTokens);
    if (nextTokens) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTokens));
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }, []);

  const apiClient = useMemo(() => createHttpClient({
    baseUrl: API_BASE_URL,
    refreshPath: `${CLIENT_AUTH_PREFIX}/refresh/`,
    getTokens: () => tokens,
    setTokens: persistTokens,
  }), [tokens, persistTokens]);
  const wrappedRequest = useCallback((path, options) => apiClient.request(path, options), [apiClient]);

  const fetchProfile = useCallback(async (accessToken) => {
    try {
      const profile = await wrappedRequest(`${CLIENT_PREFIX}/me/`, {
        token: accessToken,
      });
      setUser(profile);
      return profile;
    } catch (error) {
      console.error("Failed to fetch profile", error);
      setUser(null);
      persistTokens(null);
      throw error;
    }
  }, [persistTokens, wrappedRequest]);

  const fetchProfileRef = useRef(fetchProfile);
  useEffect(() => {
    fetchProfileRef.current = fetchProfile;
  }, [fetchProfile]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch (error) {
      console.error("Invalid stored tokens", error);
      persistTokens(null);
      setLoading(false);
      return;
    }

    if (!parsed?.access || !parsed?.refresh) {
      persistTokens(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const bootstrapAuth = async () => {
      persistTokens(parsed);
      try {
        await fetchProfileRef.current?.(parsed.access);
      } catch (error) {
        // fetchProfile already limpa tokens quando necessário
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [persistTokens]);

  const login = useCallback(async ({ email, password }) => {
    try {
      const tokenData = await wrappedRequest(`${CLIENT_AUTH_PREFIX}/login/`, {
        method: "POST",
        auth: false,
        body: { email, password },
      });

      persistTokens(tokenData);
      await fetchProfile(tokenData.access);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [fetchProfile, persistTokens, wrappedRequest]);

  const register = useCallback(async ({ email, password, rePassword, fullName, phoneNumber }) => {
    if (password !== rePassword) {
      return { ok: false, error: "As senhas não conferem." };
    }

    const digits = (phoneNumber || "").replace(/\D/g, "");
    if (!digits || digits.length < 10) {
      return { ok: false, error: "Informe um telefone válido com DDD." };
    }

    try {
      await wrappedRequest(`${CLIENT_AUTH_PREFIX}/register/`, {
        method: "POST",
        auth: false,
        body: {
          email,
          password,
          full_name: fullName || email,
          phone_number: digits,
        },
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [wrappedRequest]);

  const verifyEmail = useCallback(async ({ token }) => {
    try {
      const data = await wrappedRequest(`${CLIENT_AUTH_PREFIX}/verify-email/`, {
        method: "POST",
        auth: false,
        body: { token },
      });
      if (data.access && data.refresh) {
        persistTokens({ access: data.access, refresh: data.refresh });
        await fetchProfile(data.access);
      }
      return { ok: true, detail: data.detail };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [fetchProfile, persistTokens, wrappedRequest]);

  const forgotPassword = useCallback(async ({ email }) => {
    try {
      await wrappedRequest(`${CLIENT_AUTH_PREFIX}/forgot-password/`, {
        method: "POST",
        auth: false,
        body: { email },
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [wrappedRequest]);

  const resetPassword = useCallback(async ({ token, password }) => {
    try {
      await wrappedRequest(`${CLIENT_AUTH_PREFIX}/reset-password/`, {
        method: "POST",
        auth: false,
        body: { token, password },
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [wrappedRequest]);

  const logout = useCallback(() => {
    persistTokens(null);
    setUser(null);
  }, [persistTokens]);

  const refreshProfile = useCallback(async () => {
    const accessToken = tokens?.access;
    if (!accessToken) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }
    return fetchProfile(accessToken);
  }, [tokens, fetchProfile]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    tokens,
    forgotPassword,
    resetPassword,
    verifyEmail,
    request: wrappedRequest,
    refreshProfile,
  }), [user, loading, login, register, logout, tokens, forgotPassword, resetPassword, verifyEmail, wrappedRequest, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
