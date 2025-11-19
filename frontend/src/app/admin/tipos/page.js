"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminGuard } from "../useAdminGuard";

const EMPTY_FORM = { nome: "", slug: "" };

export default function AdminTiposPage() {
  const { ready, request } = useAdminGuard();
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchTipos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request("/api/admin/tipos/");
      setTipos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (ready) {
      fetchTipos();
    }
  }, [ready, fetchTipos]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editId) {
        await request(`/api/admin/tipos/${editId}/`, { method: "PUT", body: form });
      } else {
        await request("/api/admin/tipos/", { method: "POST", body: form });
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      await fetchTipos();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (tipo) => {
    setEditId(tipo.id);
    setForm({ nome: tipo.nome, slug: tipo.slug });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirma exclusão do tipo?")) {
      return;
    }
    try {
      await request(`/api/admin/tipos/${id}/`, { method: "DELETE" });
      setTipos((prev) => prev.filter((tipo) => tipo.id !== id));
      if (editId === id) {
        setEditId(null);
        setForm(EMPTY_FORM);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!ready) {
    return <div className="text-gray-500">Carregando...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Tipos de item</h1>
        <p className="text-sm text-gray-500">Mantenha os tipos utilizados para agrupar os produtos (ex: Camisa, Calça).</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">{editId ? "Editar tipo" : "Novo tipo"}</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">
            Nome
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Slug
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
              placeholder="ex: camiseta"
            />
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
            >
              {saving ? "Salvando..." : editId ? "Salvar" : "Cadastrar"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
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
        <h2 className="text-lg font-semibold text-gray-900">Tipos cadastrados</h2>
        {loading ? (
          <p className="py-6 text-sm text-gray-500">Carregando...</p>
        ) : tipos.length === 0 ? (
          <p className="py-6 text-sm text-gray-500">Nenhum tipo cadastrado.</p>
        ) : (
          <table className="mt-4 w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Nome</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tipos.map((tipo) => (
                <tr key={tipo.id}>
                  <td className="px-4 py-2 text-xs text-gray-500">#{tipo.id}</td>
                  <td className="px-4 py-2 font-semibold text-gray-900">{tipo.nome}</td>
                  <td className="px-4 py-2 text-gray-600">{tipo.slug}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(tipo)}
                      className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(tipo.id)}
                      className="text-sm font-semibold text-red-500 hover:text-red-600"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
