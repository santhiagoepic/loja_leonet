"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createHttpClient } from "../../lib/httpClient";

const AdminAuthContext = createContext(null);

const STORAGE_KEY = "leonet.admin.tokens";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
const ADMIN_PREFIX = "/api/admin";
const ADMIN_AUTH_PREFIX = `${ADMIN_PREFIX}/auth`;

export function AdminAuthProvider({ children }) {
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const persistTokens = useCallback((nextTokens) => {
    setTokens(nextTokens);
    if (typeof window === "undefined") {
      return;
    }
    if (nextTokens) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextTokens));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const apiClient = useMemo(() => createHttpClient({
    baseUrl: API_BASE_URL,
    refreshPath: `${ADMIN_AUTH_PREFIX}/refresh/`,
    getTokens: () => tokens,
    setTokens: persistTokens,
  }), [tokens, persistTokens]);

  const request = useCallback((path, options) => apiClient.request(path, options), [apiClient]);

  const fetchSummary = useCallback(async (accessToken) => {
    const data = await request(`${ADMIN_PREFIX}/dashboard/summary/`, {
      token: accessToken,
    });
    setSummary(data);
    return data;
  }, [request]);

  const fetchSummaryRef = useRef(fetchSummary);
  useEffect(() => {
    fetchSummaryRef.current = fetchSummary;
  }, [fetchSummary]);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch (error) {
      window.localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }
    if (!parsed?.access || !parsed?.refresh) {
      window.localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      persistTokens(parsed);
      try {
        await fetchSummaryRef.current?.(parsed.access);
      } catch (error) {
        if (!cancelled) {
          persistTokens(null);
          setSummary(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [persistTokens]);

  const login = useCallback(async ({ email, password }) => {
    try {
      const tokenData = await request(`${ADMIN_AUTH_PREFIX}/login/`, {
        method: "POST",
        auth: false,
        body: { email, password },
      });
      persistTokens(tokenData);
      await fetchSummary(tokenData.access);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }, [fetchSummary, persistTokens, request]);

  const logout = useCallback(() => {
    persistTokens(null);
    setSummary(null);
  }, [persistTokens]);

  const value = useMemo(() => ({
    tokens,
    loading,
    isAuthenticated: Boolean(tokens?.access),
    summary,
    login,
    logout,
    request,
  }), [tokens, loading, summary, login, logout, request]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth deve ser utilizado dentro de um AdminAuthProvider");
  }
  return context;
}
