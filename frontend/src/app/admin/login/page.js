"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAdminAuth } from "../../providers/admin-auth-context";

export default function AdminLoginPage() {
  const { login, loading, isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/admin");
    }
  }, [loading, isAuthenticated, router]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(form);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error || "Não foi possível entrar no painel.");
      return;
    }
    router.replace("/admin");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-10 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Painel interno</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Acessar administração</h1>
        <p className="mt-2 text-sm text-gray-500">
          Use as mesmas credenciais do seu usuário staff. Se precisa de acesso, contate o responsável técnico.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700">E-mail corporativo</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="admin@loja.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Precisa acessar a loja como cliente? <Link href="/auth/login" className="text-orange-500">Ir para login de clientes</Link>
        </p>
      </div>
    </div>
  );
}
