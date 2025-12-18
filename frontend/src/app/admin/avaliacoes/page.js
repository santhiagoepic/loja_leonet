"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminGuard } from "../useAdminGuard";
import VoltarPainel from "../components/VoltarPainel";

export default function AdminAvaliacoesPage() {
  const { ready, request } = useAdminGuard();
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState("");

  const fetchAvaliacoes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request("/api/admin/avaliacoes/");
      setAvaliacoes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (ready) {
      fetchAvaliacoes();
    }
  }, [ready, fetchAvaliacoes]);

  const handleDelete = async (id) => {
    if (!window.confirm("Excluir avaliação?")) {
      return;
    }
    try {
      await request(`/api/admin/avaliacoes/${id}/`, { method: "DELETE" });
      setAvaliacoes((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = useMemo(() => {
    if (!busca.trim()) return avaliacoes;
    const term = busca.toLowerCase();
    return avaliacoes.filter((avaliacao) =>
      [avaliacao.nome_completo, avaliacao.comentario, avaliacao.produto_nome]
        .filter(Boolean)
        .some((text) => text.toLowerCase().includes(term))
    );
  }, [avaliacoes, busca]);

  if (!ready) {
    return <div className="text-gray-500">Carregando...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Avaliações dos clientes</h1>
          <p className="text-sm text-gray-500">Modere comentários e mantenha apenas avaliações confiáveis.</p>
        </div>
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, produto ou texto"
          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm md:w-72"
        />
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="py-6 text-sm text-gray-500">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-sm text-gray-500">Nenhuma avaliação encontrada.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2">Dados</th>
                  <th className="px-4 py-2">Produto</th>
                  <th className="px-4 py-2">Avaliação</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((avaliacao) => (
                  <tr key={avaliacao.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{avaliacao.nome_completo || "Anon"}</p>
                      <p className="text-xs text-gray-500">{avaliacao.email || "Sem email"}</p>
                      <p className="text-xs text-gray-400">#{avaliacao.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{avaliacao.produto_nome || "—"}</p>
                      <p className="text-xs text-gray-500">ID: {avaliacao.produto || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">Nota {avaliacao.nota}/5</p>
                      <p className="text-sm text-gray-600">{avaliacao.comentario}</p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(avaliacao.id)}
                        className="text-sm font-semibold text-red-500 hover:text-red-600"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <VoltarPainel />
    </div>
  );
}
