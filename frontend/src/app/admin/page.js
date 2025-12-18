"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useAdminGuard } from "./useAdminGuard";

const ADMIN_SECTIONS = [
  { href: "/admin/produtos", label: "Produtos", description: "Catálogo, estoque e destaque" },
  { href: "/admin/categorias", label: "Categorias", description: "Árvore de navegação" },
  { href: "/admin/tipos", label: "Tipos", description: "Tipos de item usados em produtos" },
  { href: "/admin/banners", label: "Banners", description: "Hero e destaques visuais" },
  { href: "/admin/avaliacoes", label: "Avaliações", description: "Moderação e permissões" },
  { href: "/admin/allowed-ratings", label: "Permissões de avaliação", description: "Controle de quem pode avaliar produtos" },
  { href: "/admin/clientes", label: "Clientes", description: "Perfis verificados" },
  { href: "/admin/intencoes", label: "Intenções de compra", description: "Pedidos e funil de vendas" },
  { href: "/admin/suporte", label: "Suporte", description: "Chamados e respostas" },
];

const DEFAULT_CUSTOMER_STATS = Object.freeze({ total: 0, verified: 0, pending_verification: 0 });
const DEFAULT_INTENT_STATS = Object.freeze({ counts_by_status: {}, created_last_7_days: 0 });
const DEFAULT_REVIEW_STATS = Object.freeze({ pending_verification: 0, permissions_expiring_3_days: 0 });

export default function AdminDashboard() {
  const { ready, summary, logout } = useAdminGuard();

  const customerStats = summary?.customers ?? DEFAULT_CUSTOMER_STATS;
  const intentStats = summary?.purchase_intents ?? DEFAULT_INTENT_STATS;
  const reviewStats = summary?.reviews ?? DEFAULT_REVIEW_STATS;

  const totalIntents = useMemo(() => {
    const counts = intentStats.counts_by_status || {};
    return Object.values(counts).reduce((acc, value) => acc + (value || 0), 0);
  }, [intentStats]);

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        Carregando painel administrativo...
      </div>
    );
  }

  const lastGenerated = summary?.generated_at
    ? new Date(summary.generated_at).toLocaleString("pt-BR")
    : "-";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">Administração</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Painel da Loja Leoneth</h1>
          <p className="text-sm text-gray-500">Atualizado em {lastGenerated}</p>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <button
            onClick={logout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600"
          >
            Encerrar sessão
          </button>
          <a
            href="/auth/login"
            className="rounded-lg border border-orange-400 px-4 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
          >
            Logar como cliente de teste
          </a>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Clientes"
          value={customerStats.total || 0}
          detail={`${customerStats.verified || 0} verificados · ${customerStats.pending_verification || 0} pendentes`}
        />
        <StatCard
          title="Intenções"
          value={totalIntents}
          detail={`${intentStats.created_last_7_days || 0} nos últimos 7 dias`}
        />
        <StatCard
          title="Avaliações pendentes"
          value={reviewStats.pending_verification || 0}
          detail={`${reviewStats.permissions_expiring_3_days || 0} permissões vencendo`}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {ADMIN_SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-400"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Gerenciar</p>
            <p className="mt-1 text-xl font-semibold text-gray-900">{section.label}</p>
            <p className="mt-1 text-sm text-gray-500">{section.description}</p>
            <span className="mt-4 inline-flex items-center text-sm font-semibold text-orange-500">Acessar →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

function StatCard({ title, value, detail }) {
  const formatted = useMemo(() => new Intl.NumberFormat("pt-BR").format(value || 0), [value]);
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{formatted}</p>
      <p className="mt-2 text-sm text-gray-500">{detail}</p>
    </div>
  );
}
