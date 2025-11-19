"use client";

import Link from "next/link";
import ProductCard from "./ui/ProductCard";

export default function CategorySection({
  category,
  title,
  produtos = [],
  onWhatsApp,
  imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/",
  showSeeAll = true,
}) {
  if (!produtos.length) return null;

  return (
    <section className="mb-16">
      <div className="mb-8 flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{title}</h2>
      </div>

      {produtos.map((grupo, index) => (
        <div key={grupo.tipo ?? index} className="mb-10">
          {grupo.tipo && (
            <h3 className="mb-6 text-2xl font-semibold text-orange-500">{grupo.tipo}</h3>
          )}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {grupo.produtos.map((produto) => (
              <ProductCard
                key={produto.id}
                product={produto}
                imageBaseUrl={imageBaseUrl}
                onWhatsApp={onWhatsApp}
                badge={grupo.tipo}
              />
            ))}
          </div>
        </div>
      ))}

      {showSeeAll && category && (
        <div className="mt-8 flex justify-center">
          <Link
            href={`/${category}`}
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 py-3 font-semibold text-white transition duration-200 hover:scale-105 hover:bg-orange-600"
          >
            Ver todos os {title?.toLowerCase() ?? "produtos"}
          </Link>
        </div>
      )}
    </section>
  );
}
