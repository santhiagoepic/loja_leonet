"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../providers/auth-context";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState({ state: token ? "verifying" : "missing" });
  const verifyEmailRef = useRef(verifyEmail);

  useEffect(() => {
    verifyEmailRef.current = verifyEmail;
  }, [verifyEmail]);

  useEffect(() => {
    if (!token) {
      setStatus({ state: "error", message: "Token inválido ou expirado." });
      return;
    }

    let cancelled = false;

    const runVerification = async () => {
      setStatus({ state: "verifying" });
      const result = await verifyEmailRef.current({ token });
      if (cancelled) {
        return;
      }
      if (result.ok) {
        setStatus({ state: "success", message: "E-mail confirmado! Redirecionando..." });
        setTimeout(() => router.push("/conta"), 2500);
      } else {
        setStatus({ state: "error", message: result.error || "Não foi possível confirmar seu e-mail." });
      }
    };

    runVerification();

    return () => {
      cancelled = true;
    };
  }, [token, router]);

  const renderContent = () => {
    switch (status.state) {
      case "verifying":
        return (
          <>
            <p className="text-sm text-gray-500">Validando seu token...</p>
            <div className="mt-6 flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" aria-label="Carregando" />
            </div>
          </>
        );
      case "success":
        return (
          <>
            <p className="text-sm text-green-600">{status.message}</p>
            <p className="mt-2 text-sm text-gray-500">Abra a central da conta para completar seu perfil.</p>
            <div className="mt-6 space-y-2">
              <Link href="/conta" className="block rounded-lg bg-orange-500 px-4 py-3 text-center font-semibold text-white hover:bg-orange-600">
                Ir para minha conta
              </Link>
              <Link href="/" className="block rounded-lg border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700 hover:border-gray-300">
                Voltar para a loja
              </Link>
            </div>
          </>
        );
      case "error":
        return (
          <>
            <p className="text-sm text-red-600">{status.message}</p>
            <div className="mt-6 space-y-2">
              <Link href="/auth/forgot-password" className="block rounded-lg bg-orange-500 px-4 py-3 text-center font-semibold text-white hover:bg-orange-600">
                Solicitar um novo link
              </Link>
              <Link href="/" className="block rounded-lg border border-gray-200 px-4 py-3 text-center font-semibold text-gray-700 hover:border-gray-300">
                Voltar para a loja
              </Link>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-gray-900">Confirmar e-mail</h1>
        <p className="mt-2 text-sm text-gray-500">
          Estamos finalizando a ativação da sua conta Leonet.
        </p>
        <div className="mt-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-10 text-center">Carregando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
