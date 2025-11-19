"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { buildImageUrl } from "../../lib/images";

const formatCurrency = (value) => {
  if (value === undefined || value === null || value === "") {
    return "R$ 0,00";
  }
  const normalized = typeof value === "number" ? value : Number.parseFloat(value);
  if (Number.isNaN(normalized)) {
    return "R$ 0,00";
  }
  return normalized.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

export default function ProductCard({
  product,
  imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/",
  onWhatsApp,
  badge,
  accent = "text-orange-500",
}) {
  if (!product) return null;

  const productLabel = badge || product.tipo_label || product.tipo || "Coleção exclusiva";
  const image = buildImageUrl(product.imagem, imageBaseUrl);
  const identifier = product.slug ?? product.id;
  const detailHref = identifier ? `/produto/${identifier}` : null;

  const handleWhatsApp = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (typeof onWhatsApp === "function") {
      onWhatsApp(product);
    }
  };

  const card = (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={image}
          alt={product.nome || "Produto"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {product.em_destaque && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-orange-500 shadow">
            Destaque
          </span>
        )}

        {onWhatsApp && (
          <div className="pointer-events-none absolute inset-0 flex flex-col gap-3 bg-gradient-to-b from-black/70 via-black/50 to-transparent p-4 opacity-0 transition duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
            <button
              onClick={handleWhatsApp}
              className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" />
              Falar no WhatsApp
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 py-4">
        <p className={`text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 ${accent}`}>
          {productLabel}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-gray-900 line-clamp-2">{product.nome}</h3>
        {product.descricao && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-3">{product.descricao}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-2xl font-bold text-orange-500">{formatCurrency(product.preco)}</span>
        </div>
      </div>
    </article>
  );

  if (detailHref) {
    return (
      <Link href={detailHref} className="group block" prefetch={false}>
        {card}
      </Link>
    );
  }

  return card;
}
