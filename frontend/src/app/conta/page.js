"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { useAuth } from "../providers/auth-context";

const formatDate = (isoString) => {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return isoString;
  }
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login?redirect=/conta");
    }
  }, [loading, user, router]);

  const profile = useMemo(() => ({
    nome: user?.full_name || "-",
    email: user?.email || "-",
    telefone: user?.phone_number || "Não informado",
    criadoEm: formatDate(user?.created_at),
    verificado: user?.email_verified ?? false,
  }), [user]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (loading || (user == null && typeof window === "undefined")) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="mx-auto w-full max-w-4xl rounded-2xl bg-white p-12 shadow-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 animate-spin rounded-full border-4 border-orange-200 border-t-orange-500" aria-label="Carregando" />
            <p className="text-gray-500">Carregando seus dados...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-10 text-center shadow-xl">
          <h1 className="text-2xl font-semibold text-gray-900">Faça login para acessar</h1>
          <p className="mt-2 text-gray-500">
            Sua sessão expirou ou você ainda não entrou. Use o botão abaixo para fazer login e voltar automaticamente para a conta.
          </p>
          <Link
            href="/auth/login?redirect=/conta"
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Ir para o login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 lg:flex-row">
        <section className="w-full rounded-2xl bg-white p-8 shadow-xl lg:w-2/3">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-gray-500">Minha conta</p>
              <h1 className="text-3xl font-semibold text-gray-900">Olá, {profile.nome.split(" ")[0]}</h1>
              <p className="text-gray-500">Gerencie seus dados, status de verificações e próximos pedidos.</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
            >
              Sair
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-orange-50/40 p-6">
              <p className="text-sm font-semibold text-gray-500">Status do e-mail</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{profile.verificado ? "Verificado" : "Pendente"}</p>
              <p className="mt-2 text-sm text-gray-600">
                {profile.verificado
                  ? "Sua conta já está confirmada e pronta para compras."
                  : "Finalize a confirmação para liberar todos os recursos."}
              </p>
              {profile.verificado ? null : (
                <Link href="/auth/verify-email" className="mt-4 inline-block text-sm font-semibold text-orange-500">
                  Reenviar link de confirmação
                </Link>
              )}
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <p className="text-sm font-semibold text-gray-500">Desde</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{profile.criadoEm}</p>
              <p className="mt-2 text-sm text-gray-600">Obrigado por fazer parte da Leonet.</p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="text-xl font-semibold text-gray-900">Dados cadastrais</h2>
            <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-gray-500">Nome completo</dt>
                <dd className="text-base font-medium text-gray-900">{profile.nome}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">E-mail</dt>
                <dd className="text-base font-medium text-gray-900">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">Telefone</dt>
                <dd className="text-base font-medium text-gray-900">{profile.telefone}</dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500">ID do cliente</dt>
                <dd className="text-base font-medium text-gray-900">#{user.id}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300">
                Editar dados
              </button>
              <button className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-300">
                Atualizar senha
              </button>
            </div>
          </div>
        </section>

        <aside className="w-full space-y-6 lg:w-1/3">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900">Ações rápidas</h3>
            <ul className="mt-4 space-y-3 text-sm font-medium text-gray-700">
              <li>
                <Link href="/suporte" className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:border-orange-200">
                  <span>Falar com suporte</span>
                  <span className="text-xs text-orange-500">Em até 2h úteis</span>
                </Link>
              </li>
              <li>
                <Link href="/contato" className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:border-orange-200">
                  <span>Atualizar endereços</span>
                  <span className="text-xs text-gray-400">Em breve</span>
                </Link>
              </li>
              <li>
                <Link href="/acessorios" className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 hover:border-orange-200">
                  <span>Explorar novidades</span>
                  <span className="text-xs text-green-500">Novo</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-orange-500/10 p-6 text-gray-900 shadow-lg">
            <h3 className="text-lg font-semibold">Avaliações com foto</h3>
            <p className="mt-2 text-sm text-gray-600">
              Compartilhe sua experiência e ganhe destaque na vitrine de clientes Leonet.
            </p>
            <Link
              href="/suporte"
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Enviar avaliação
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
