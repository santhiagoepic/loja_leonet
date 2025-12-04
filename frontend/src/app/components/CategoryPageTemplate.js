"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import CategorySection from "./CategorySection";
import { apiUrl } from "../../lib/api";
import { buildImageUrl } from "../lib/images";

const IMAGE_BASE_URL = "https://res.cloudinary.com/dzlm6jkhv/";
const PHONE_NUMBER = "5563984107523";

const buildWhatsAppMessage = (produto) => {
  const nomeProduto = produto.nome || "Produto";
  const descricao = produto.descricao || "Sem descrição disponível";
  const preco = produto.preco ? Number.parseFloat(produto.preco).toFixed(2).replace(".", ",") : "sob consulta";
  const imageUrl = produto?.imagem ? buildImageUrl(produto.imagem, IMAGE_BASE_URL) : null;
  return `🛍️ *INTERESSE NO PRODUTO* 🛍️\n\n*Produto:* ${nomeProduto}\n*Descrição:* ${descricao}\n*Preço:* R$ ${preco}\n${imageUrl ? `*Foto:* ${imageUrl}\n` : ""}\nOlá! Gostaria de mais informações sobre este produto.`;
};

export default function CategoryPageTemplate({ endpoint, category, title }) {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(apiUrl(endpoint));
        if (!response.ok) {
          throw new Error("Erro ao carregar produtos.");
        }
        const data = await response.json();
        setGrupos(data);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os produtos desta categoria.");
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, [endpoint]);

  const handleWhatsApp = (produto) => {
    const message = encodeURIComponent(buildWhatsAppMessage(produto));
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${message}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">Coleção exclusiva</p>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-500">Descubra as novidades selecionadas para você.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <p className="py-20 text-center text-red-500">{error}</p>
        ) : (
          <CategorySection
            category={category}
            title={title}
            produtos={grupos}
            onWhatsApp={handleWhatsApp}
            imageBaseUrl={IMAGE_BASE_URL}
            showSeeAll={false}
          />
        )}
      </div>
    </div>
  );
}
