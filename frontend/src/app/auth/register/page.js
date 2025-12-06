"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../providers/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [formState, setFormState] = useState({ fullName: "", phoneNumber: "", email: "", password: "", rePassword: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    const result = await register(formState);
    setSubmitting(false);
    if (!result.ok) {
      setStatus({ type: "error", message: result.error || "Não foi possível criar a conta." });
      return;
    }
    setStatus({ type: "success", message: "Conta criada! Verifique seu e-mail para confirmar e faça login." });
    setTimeout(() => router.push("/auth/login"), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-gray-900">Criar conta</h1>
        <p className="mt-2 text-sm text-gray-500">
          Já possui acesso? <Link className="text-orange-500" href="/auth/login">Entrar</Link>
        </p>

        <form className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome completo</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formState.fullName}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="Seu nome"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefone com DDD</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="tel"
              required
              value={formState.phoneNumber}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="(63) 99999-9999"
            />
            <p className="mt-1 text-xs text-gray-400">Usaremos este número para enviar os produtos automaticamente via WhatsApp.</p>
          </div>

          <div className="md:col-span-2">
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

          <div>
            <label htmlFor="rePassword" className="block text-sm font-medium text-gray-700">Confirmar senha</label>
            <input
              id="rePassword"
              name="rePassword"
              type="password"
              required
              value={formState.rePassword}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {status ? (
            <div className={`md:col-span-2 rounded-lg border p-3 text-sm ${status.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {status.message}
            </div>
          ) : null}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
            >
              {submitting ? "Enviando..." : "Criar conta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
