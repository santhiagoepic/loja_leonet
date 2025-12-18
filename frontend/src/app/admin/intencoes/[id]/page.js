"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminGuard } from "../../useAdminGuard";

export default function IntencaoDetalhePage({ params }) {
  const { ready, logout } = useAdminGuard();
  const router = useRouter();
  const { id } = params;
  const [intencao, setIntencao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchIntencao() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/pedidos-intencao/${id}/`, { cache: "no-store" });
        if (!res.ok) throw new Error("Erro ao buscar intenção de compra");
        const data = await res.json();
        setIntencao(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchIntencao();
  }, [id]);

  if (!ready) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Carregando...</div>;
  }

  if (loading) {
    return <div className="text-center text-gray-500">Carregando intenção...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!intencao) {
    return <div className="text-center text-gray-500">Intenção não encontrada.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Detalhes da Intenção de Compra</h1>
      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <div><span className="font-semibold">ID:</span> {intencao.id}</div>
        <div><span className="font-semibold">Cliente:</span> {intencao.usuario?.email || intencao.usuario_nome || '-'}</div>
        <div><span className="font-semibold">Produto:</span> {intencao.produto?.nome || intencao.produto_nome || '-'}</div>
        <div><span className="font-semibold">Status:</span> {intencao.status}</div>
        <div><span className="font-semibold">Criado em:</span> {intencao.criado_em ? new Date(intencao.criado_em).toLocaleString("pt-BR") : '-'}</div>
        <div><span className="font-semibold">Telefone:</span> {intencao.telefone_contato || '-'}</div>
        <div><span className="font-semibold">Endereço:</span> {intencao.endereco_entrega || '-'}</div>
        <div><span className="font-semibold">Observações do cliente:</span> {intencao.observacoes_cliente || '-'}</div>
        <div><span className="font-semibold">Observações admin:</span> {intencao.observacoes_admin || '-'}</div>
        <div><span className="font-semibold">Confirmado por:</span> {intencao.confirmado_por?.email || '-'}</div>
        <div><span className="font-semibold">Confirmado em:</span> {intencao.confirmado_em ? new Date(intencao.confirmado_em).toLocaleString("pt-BR") : '-'}</div>
      </div>
      <button onClick={() => router.back()} className="mt-8 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600">Voltar</button>
      <button onClick={logout} className="ml-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600">Sair</button>
    </div>
  );
}
