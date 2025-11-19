"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../providers/auth-context";

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const router = useRouter();
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!loading && user) {
    router.replace("/conta");
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(formState);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error || "Não foi possível entrar.");
      return;
    }
    router.push("/conta");
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-gray-900">Entrar</h1>
        <p className="mt-2 text-sm text-gray-500">
          Ainda não tem conta? <Link className="text-orange-500" href="/auth/register">Crie agora</Link>
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formState.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="exemplo@dominio.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formState.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/auth/forgot-password" className="text-orange-500">
            Esqueci minha senha
          </Link>
        </div>
      </div>
    </div>
  );
}
