"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminGuard } from "../useAdminGuard";
import VoltarPainel from "../components/VoltarPainel";

const EMPTY_FORM = { nome: "", slug: "" };

export default function AdminCategoriasPage() {
  const { ready, request } = useAdminGuard();
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request("/api/admin/categorias/");
      setCategorias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (ready) {
      fetchCategorias();
    }
  }, [ready, fetchCategorias]);

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
        await request(`/api/admin/categorias/${editId}/`, { method: "PUT", body: form });
      } else {
        await request("/api/admin/categorias/", { method: "POST", body: form });
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      await fetchCategorias();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (categoria) => {
    setEditId(categoria.id);
    setForm({ nome: categoria.nome, slug: categoria.slug });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirma exclusão da categoria?")) {
      return;
    }
    try {
      await request(`/api/admin/categorias/${id}/`, { method: "DELETE" });
      setCategorias((prev) => prev.filter((categoria) => categoria.id !== id));
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
        <h1 className="text-2xl font-semibold text-gray-900">Categorias</h1>
        <p className="text-sm text-gray-500">Organize os grupos exibidos na home e nos filtros.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">{editId ? "Editar categoria" : "Nova categoria"}</h2>
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
              placeholder="ex: feminino"
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
        <h2 className="text-lg font-semibold text-gray-900">Categorias cadastradas</h2>
        {loading ? (
          <p className="py-6 text-sm text-gray-500">Carregando...</p>
        ) : categorias.length === 0 ? (
          <p className="py-6 text-sm text-gray-500">Nenhuma categoria cadastrada.</p>
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
              {categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td className="px-4 py-2 text-xs text-gray-500">#{categoria.id}</td>
                  <td className="px-4 py-2 font-semibold text-gray-900">{categoria.nome}</td>
                  <td className="px-4 py-2 text-gray-600">{categoria.slug}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => handleEdit(categoria)}
                      className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(categoria.id)}
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
      <VoltarPainel />
    </div>
  );
}
