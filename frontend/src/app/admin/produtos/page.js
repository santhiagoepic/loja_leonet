"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminGuard } from "../useAdminGuard";

const EMPTY_FORM = {
  nome: "",
  descricao: "",
  preco: "",
  estoque: "",
  link_whatsapp: "",
  categoria_id: "",
  tipo_id: "",
  em_destaque: false,
};

export default function AdminProdutosPage() {
  const { ready, request } = useAdminGuard();
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [produtosData, categoriasData, tiposData] = await Promise.all([
        request("/api/admin/produtos/"),
        request("/api/admin/categorias/"),
        request("/api/admin/tipos/"),
      ]);
      setProdutos(produtosData);
      setCategorias(categoriasData);
      setTipos(tiposData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (ready) {
      fetchData();
    }
  }, [ready, fetchData]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null;
    setImagemArquivo(file);
    setImagemPreview((prev) => {
      const previous = prev;
      const wasBlob = previous?.startsWith("blob:");
      if (wasBlob && previous) {
        URL.revokeObjectURL(previous);
      }
      if (!file) {
        return wasBlob ? null : previous ?? null;
      }
      return URL.createObjectURL(file);
    });
  };

  useEffect(() => {
    return () => {
      if (imagemPreview && imagemPreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagemPreview);
      }
    };
  }, [imagemPreview]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!editId && !imagemArquivo) {
      setError("Selecione uma imagem do produto antes de salvar.");
      return;
    }
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.append("nome", form.nome);
    formData.append("descricao", form.descricao);
    formData.append("preco", String(form.preco || ""));
    formData.append("estoque", String(form.estoque || 0));
    formData.append("link_whatsapp", form.link_whatsapp);
    formData.append("categoria_id", form.categoria_id);
    formData.append("tipo_id", form.tipo_id);
    formData.append("em_destaque", form.em_destaque ? "true" : "false");
    if (imagemArquivo) {
      formData.append("imagem", imagemArquivo);
    }

    try {
      if (editId) {
        await request(`/api/admin/produtos/${editId}/`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await request("/api/admin/produtos/", {
          method: "POST",
          body: formData,
        });
      }
      setForm(EMPTY_FORM);
      setEditId(null);
      setImagemArquivo(null);
      setImagemPreview((prev) => {
        if (prev && prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev);
        }
        return null;
      });
      await fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (produto) => {
    setEditId(produto.id);
    setForm({
      nome: produto.nome || "",
      descricao: produto.descricao || "",
      preco: produto.preco ?? "",
      estoque: produto.estoque ?? "",
      link_whatsapp: produto.link_whatsapp || "",
      categoria_id: produto.categoria?.id || produto.categoria || "",
      tipo_id: produto.tipo?.id || produto.tipo || "",
      em_destaque: Boolean(produto.em_destaque),
    });
    setImagemArquivo(null);
    setImagemPreview(produto.imagem || null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirma exclusão do produto?")) {
      return;
    }
    setError(null);
    try {
      await request(`/api/admin/produtos/${id}/`, { method: "DELETE" });
      setProdutos((prev) => prev.filter((produto) => produto.id !== id));
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
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Produtos</h1>
        <p className="text-sm text-gray-500">Gerencie o catálogo disponível no site.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">{editId ? "Editar produto" : "Novo produto"}</h2>
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
            Preço
            <input
              name="preco"
              type="number"
              step="0.01"
              value={form.preco}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
            />
          </label>
          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            Descrição
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
              rows={3}
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Imagem do produto
            <input
              type="file"
              name="imagem"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
            />
            {imagemPreview && (
              <div className="mt-2 rounded-lg border border-dashed border-gray-300 p-2">
                <p className="text-xs text-gray-500">Pré-visualização atual</p>
                <img src={imagemPreview} alt="Prévia do produto" className="mt-1 h-32 w-full rounded-lg object-cover" />
              </div>
            )}
          </label>
          <label className="text-sm font-medium text-gray-700">
            Link WhatsApp
            <input
              name="link_whatsapp"
              value={form.link_whatsapp}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Estoque
            <input
              name="estoque"
              type="number"
              value={form.estoque}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
            />
          </label>
          <label className="text-sm font-medium text-gray-700">
            Categoria
            <select
              name="categoria_id"
              value={form.categoria_id}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
            >
              <option value="">Selecione</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nome}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-700">
            Tipo de item
            <select
              name="tipo_id"
              value={form.tipo_id}
              onChange={handleChange}
              required
              className="mt-1 w-full rounded-lg border border-gray-200 p-2"
            >
              <option value="">Selecione</option>
              {tipos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>{tipo.nome}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="em_destaque"
              checked={form.em_destaque}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            Destacar na home
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-70"
            >
              {saving ? "Salvando..." : editId ? "Salvar alterações" : "Cadastrar produto"}
            </button>
            {editId && (
              <button
                type="button"
                onClick={() => {
                  setEditId(null);
                  setForm(EMPTY_FORM);
                  setImagemArquivo(null);
                  setImagemPreview((prev) => {
                    if (prev && prev.startsWith("blob:")) {
                      URL.revokeObjectURL(prev);
                    }
                    return null;
                  });
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-600"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Catálogo atual</h2>
        {loading ? (
          <p className="py-6 text-sm text-gray-500">Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <p className="py-6 text-sm text-gray-500">Nenhum produto cadastrado.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Nome</th>
                  <th className="px-4 py-2">Preço</th>
                  <th className="px-4 py-2">Estoque</th>
                  <th className="px-4 py-2">Categoria</th>
                  <th className="px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {produtos.map((produto) => (
                  <tr key={produto.id}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">#{produto.id}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{produto.nome}</td>
                    <td className="px-4 py-3 text-gray-700">R$ {Number(produto.preco).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-700">{produto.estoque}</td>
                    <td className="px-4 py-3 text-gray-700">{produto.categoria?.nome || "-"}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => handleEdit(produto)}
                        className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(produto.id)}
                        className="text-sm font-semibold text-red-500 hover:text-red-600"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
