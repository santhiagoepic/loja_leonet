"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAdminGuard } from "../useAdminGuard";
import VoltarPainel from "../components/VoltarPainel";

const EMPTY_FORM = { full_name: "", phone_number: "" };

export default function AdminClientesPage() {
  const { ready, request } = useAdminGuard();
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busca, setBusca] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request("/api/admin/clientes/");
      setClientes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (ready) {
      fetchClientes();
    }
  }, [ready, fetchClientes]);

  const filtered = useMemo(() => {
    if (!busca.trim()) return clientes;
    const term = busca.toLowerCase();
    return clientes.filter((cliente) =>
      [cliente.full_name, cliente.email, cliente.phone_number]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(term))
    );
  }, [clientes, busca]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (!selectedId) {
        throw new Error("Selecione um cliente para atualizar");
      }
      await request(`/api/admin/clientes/${selectedId}/`, { method: "PATCH", body: form });
      setForm(EMPTY_FORM);
      setSelectedId(null);
      await fetchClientes();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cliente) => {
    setSelectedId(cliente.id);
    setForm({
      full_name: cliente.full_name || "",
      phone_number: cliente.phone_number || "",
    });
  };

  if (!ready) {
    return <div className="text-gray-500">Carregando...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Clientes cadastrados</h1>
          <p className="text-sm text-gray-500">Selecione um cliente para editar o nome exibido e o telefone cadastrado.</p>
        </div>
        <input
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por nome, email ou telefone"
          className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm md:w-80"
        />
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Editar cliente selecionado</h2>
        <p className="text-sm text-gray-500">Clique em um cliente na lista para carregar os dados.</p>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Nome completo
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
              placeholder="Selecione um cliente"
              disabled={!selectedId}
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Telefone
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
              placeholder="(11) 99999-9999"
              disabled={!selectedId}
            />
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving || !selectedId}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </button>
            {selectedId && (
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setForm(EMPTY_FORM);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="py-6 text-sm text-gray-500">Carregando...</p>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-sm text-gray-500">Nenhum cliente encontrado.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2">Cliente</th>
                  <th className="px-4 py-2">Contato</th>
                  <th className="px-4 py-2">Criado em</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((cliente) => (
                  <tr key={cliente.id} className={selectedId === cliente.id ? "bg-orange-50" : undefined}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{cliente.full_name || "Sem nome"}</p>
                      <p className="text-xs text-gray-400">#{cliente.id}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{cliente.email}</p>
                      <p className="text-xs text-gray-500">{cliente.phone_number || "Sem telefone"}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {cliente.created_at ? new Date(cliente.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleEdit(cliente)}
                        className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                      >
                        Selecionar
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
