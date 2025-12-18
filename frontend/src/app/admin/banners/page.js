"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react";
import { useAdminGuard } from "../useAdminGuard";
import VoltarPainel from "../components/VoltarPainel";

const EMPTY_FORM = { ativo: true };

export default function AdminBannersPage() {
  const { ready, request } = useAdminGuard();
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [imagemArquivo, setImagemArquivo] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request("/api/admin/banners/");
      setBanners(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    if (ready) {
      fetchBanners();
    }
  }, [ready, fetchBanners]);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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
      setError("Selecione uma imagem para cadastrar o banner.");
      return;
    }
    setSaving(true);
    setError(null);
    const formData = new FormData();
    formData.append("ativo", form.ativo ? "true" : "false");
    if (imagemArquivo) {
      formData.append("imagem", imagemArquivo);
    }
    try {
      if (editId) {
        await request(`/api/admin/banners/${editId}/`, { method: "PUT", body: formData });
      } else {
        await request("/api/admin/banners/", { method: "POST", body: formData });
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
      await fetchBanners();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (banner) => {
    setEditId(banner.id);
    setForm({ ativo: Boolean(banner.ativo) });
    setImagemArquivo(null);
    setImagemPreview(banner.imagem || null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remover este banner?")) {
      return;
    }
    try {
      await request(`/api/admin/banners/${id}/`, { method: "DELETE" });
      setBanners((prev) => prev.filter((banner) => banner.id !== id));
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
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900">Banners</h1>
        <p className="text-sm text-gray-500">Gerencie os destaques exibidos na home e nas campanhas.</p>
      </header>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">{editId ? "Editar banner" : "Novo banner"}</h2>
        <form onSubmit={handleSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700 md:col-span-2">
            Imagem do banner
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
                <img src={imagemPreview} alt="Prévia do banner" className="mt-1 h-32 w-full rounded-lg object-cover" />
              </div>
            )}
          </label>
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="ativo"
              checked={form.ativo}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            Banner ativo
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
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Banners cadastrados</h2>
        {loading ? (
          <p className="py-6 text-sm text-gray-500">Carregando...</p>
        ) : banners.length === 0 ? (
          <p className="py-6 text-sm text-gray-500">Nenhum banner cadastrado.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {banners.map((banner) => (
              <article key={banner.id} className={`rounded-xl border ${banner.ativo ? "border-gray-200" : "border-dashed border-gray-300"} p-4`}>
                <figure className="overflow-hidden rounded-lg border border-gray-100">
                  <img src={banner.imagem} alt={`Banner ${banner.id}`} className="h-40 w-full object-cover" />
                </figure>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Banner #{banner.id}</p>
                  <span className={`rounded-full px-2 py-1 text-xs ${banner.ativo ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {banner.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
                <div className="mt-3 space-x-3">
                  <button onClick={() => handleEdit(banner)} className="text-sm font-semibold text-orange-500 hover:text-orange-600">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="text-sm font-semibold text-red-500 hover:text-red-600">
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <VoltarPainel />
    </div>
  );
}
