"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { useAuth } from "../../providers/auth-context";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      setStatus({ type: "error", message: "Token inválido ou expirado." });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "As senhas precisam ser iguais." });
      return;
    }
    setSubmitting(true);
    setStatus(null);
    const result = await resetPassword({ token, password });
    setSubmitting(false);
    if (!result.ok) {
      setStatus({ type: "error", message: result.error || "Não foi possível redefinir a senha." });
      return;
    }
    setStatus({ type: "success", message: "Senha redefinida! Você será redirecionado." });
    setTimeout(() => router.push("/auth/login"), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto w-full max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-gray-900">Definir nova senha</h1>
        <p className="mt-2 text-sm text-gray-500">
          Recebeu outro e-mail? Use o token mais recente.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Nova senha</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar nova senha</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 p-3 focus:border-orange-500 focus:outline-none"
              placeholder="••••••••"
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
            {submitting ? "Salvando..." : "Atualizar senha"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
          <Link href="/auth/login" className="text-orange-500">Voltar para o login</Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-10 text-center">Carregando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
