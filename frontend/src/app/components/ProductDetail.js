"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MessageCircle, Star, Loader2 } from "lucide-react";
import axios from "axios";
import AvaliacaoModal from "./AvaliacaoModal";
import { apiUrl } from "../../lib/api";
import { buildImageUrl } from "../lib/images";

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") return "R$ 0,00";
  const normalized = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(normalized)) return "R$ 0,00";
  return normalized.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export default function ProductDetail({ slug }) {
  const [produto, setProduto] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avaliacaoModalOpen, setAvaliacaoModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    nota: "",
    nomeCompleto: "",
    comentario: "",
    fotoProduto: null,
    tipoAvaliacaoId: "",
    tamanho: "",
    cor: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingAvaliacao, setLoadingAvaliacao] = useState(false);

  useEffect(() => {
    async function fetchProduto() {
      try {
        setLoading(true);
        const productRes = await axios.get(apiUrl(`/api/produtos/${slug}/`));
        setProduto(productRes.data);
        await fetchAvaliacoes(productRes.data.id);
      } catch (err) {
        console.error(err);
        setError("Produto não encontrado.");
      } finally {
        setLoading(false);
      }
    }

    async function fetchAvaliacoes(produtoId) {
      try {
        setLoadingAvaliacao(true);
        const avaliacaoRes = await axios.get(apiUrl(`/api/avaliacoes/?produto_id=${produtoId}`));
        setAvaliacoes(avaliacaoRes.data);
      } catch (err) {
        console.error("Erro ao carregar avaliações", err);
        setAvaliacoes([]);
      } finally {
        setLoadingAvaliacao(false);
      }
    }

    fetchProduto();
  }, [slug]);

  const handleWhatsApp = () => {
    if (!produto) return;
    const phoneNumber = "5563984107523";
    const nomeProduto = produto.nome || "Produto";
    const descricao = produto.descricao || "Sem descrição disponível";
    const preco = produto.preco ? formatCurrency(produto.preco) : "Preço sob consulta";
    const message = `🛍️ *INTERESSE NO PRODUTO* 🛍️\n\n*Produto:* ${nomeProduto}\n*Descrição:* ${descricao}\n*Preço:* ${preco}\n\nOlá! Gostaria de mais informações sobre este produto.`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, "_blank", "noopener,noreferrer");
  };

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!produto) return;

    setSubmitting(true);
    setErrors({});

    try {
      const formData = new FormData();
      formData.append("produto_id", produto.id);
      formData.append("tipo_avaliacao_id", formState.tipoAvaliacaoId || "1");
      formData.append("nota", formState.nota);
      formData.append("nome_completo", formState.nomeCompleto);
      formData.append("comentario", formState.comentario);
      if (formState.fotoProduto) {
        formData.append("foto_produto", formState.fotoProduto);
      }
      if (formState.tamanho) {
        formData.append("tamanho", formState.tamanho);
      }
      if (formState.cor) {
        formData.append("cor", formState.cor);
      }

      const response = await axios.post(apiUrl("/api/avaliacoes/"), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setAvaliacoes((prev) => [response.data, ...prev]);
      setFormState({
        nota: "",
        nomeCompleto: "",
        comentario: "",
        fotoProduto: null,
        tipoAvaliacaoId: "",
        tamanho: "",
        cor: "",
      });
      setAvaliacaoModalOpen(false);
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({ geral: "Erro ao enviar avaliação." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !produto) {
    return (
      <div className="py-24 text-center">
        <p className="text-lg font-semibold text-gray-600">{error || "Produto indisponível."}</p>
      </div>
    );
  }

  const image = buildImageUrl(produto.imagem);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-16">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-lg">
          <Image src={image} alt={produto.nome} width={900} height={1200} className="h-full w-full object-cover" priority sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw" />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">{produto.tipo?.nome || produto.categoria?.nome}</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">{produto.nome}</h1>
            {produto.descricao && <p className="mt-3 text-base text-gray-600">{produto.descricao}</p>}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm uppercase text-gray-400">Preço</p>
            <p className="text-4xl font-bold text-orange-500">{formatCurrency(produto.preco)}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={handleWhatsApp} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-green-700">
              <MessageCircle className="h-5 w-5" /> Falar no WhatsApp
            </button>
            <button onClick={() => setAvaliacaoModalOpen(true)} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-6 py-4 text-lg font-semibold text-gray-900 transition hover:border-orange-400 hover:text-orange-500">
              <Star className="h-5 w-5 text-orange-400" /> Avaliar produto
            </button>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Detalhes</h2>
            <dl className="mt-4 grid gap-3 text-sm text-gray-600">
              {produto.cor && (
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-3">
                  <dt className="font-medium text-gray-500">Cor</dt>
                  <dd>{produto.cor}</dd>
                </div>
              )}
              {produto.tamanho && (
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-3">
                  <dt className="font-medium text-gray-500">Tamanho</dt>
                  <dd>{produto.tamanho}</dd>
                </div>
              )}
              {produto.material && (
                <div className="flex justify-between border-b border-dashed border-gray-100 pb-3">
                  <dt className="font-medium text-gray-500">Material</dt>
                  <dd>{produto.material}</dd>
                </div>
              )}
              {produto.cuidados && (
                <div className="flex justify-between">
                  <dt className="font-medium text-gray-500">Cuidados</dt>
                  <dd className="text-right">{produto.cuidados}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <section className="mx-auto mt-16 max-w-5xl rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400">Avaliações</p>
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">O que estão falando</h2>
          </div>
        </div>

        {loadingAvaliacao ? (
          <div className="mt-8 flex items-center gap-2 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Carregando avaliações...
          </div>
        ) : avaliacoes.length ? (
          <ul className="mt-8 grid gap-6 md:grid-cols-2">
            {avaliacoes.map((avaliacao) => (
              <li key={avaliacao.id} className="rounded-2xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{avaliacao.nome_completo}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
                    <Star className="h-4 w-4 fill-orange-500 text-orange-500" /> {avaliacao.nota}/5
                  </span>
                </div>
                {avaliacao.comentario && <p className="mt-4 text-gray-600">{avaliacao.comentario}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-gray-500">Ainda não há avaliações para este produto.</p>
        )}
      </section>

      {avaliacaoModalOpen && (
        <AvaliacaoModal
          produto={produto}
          avaliacoes={avaliacoes}
          loadingAvaliacao={loadingAvaliacao}
          onClose={() => setAvaliacaoModalOpen(false)}
          onSubmit={handleSubmit}
          formState={formState}
          onFormChange={handleFormChange}
          errors={errors}
          submitting={submitting}
        />
      )}
    </div>
    </div>
  );
}
