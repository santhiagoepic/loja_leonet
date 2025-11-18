"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../providers/auth-context";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);
    const result = await forgotPassword({ email });
    setSubmitting(false);
    if (!result.ok) {
      setStatus({ type: "error", message: result.error || "Não foi possível enviar o e-mail." });
      return;
    }
    setStatus({ type: "success", message: "Se o e-mail estiver cadastrado, enviaremos as instruções em instantes." });
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-gray-900">Recuperar senha</h1>
        <p className="mt-2 text-sm text-gray-500">
          Lembrou a senha? <Link className="text-orange-500" href="/auth/login">Entrar</Link>
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail cadastrado</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="exemplo@dominio.com"
            />
          </div>

          {status ? (
            <div className={`rounded-lg border p-3 text-sm ${status.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              {status.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {submitting ? "Enviando..." : "Enviar instruções"}
          </button>
        </form>
      </div>
    </div>
  );
}
