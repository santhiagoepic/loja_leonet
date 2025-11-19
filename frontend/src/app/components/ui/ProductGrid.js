"use client";

import ProductCard from "./ProductCard";

export default function ProductGrid({
  products = [],
  imageBaseUrl,
  onWhatsApp,
  emptyMessage = "Nenhum produto disponível no momento.",
}) {
  if (!products.length) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center text-sm text-gray-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          imageBaseUrl={imageBaseUrl}
          onWhatsApp={onWhatsApp}
          badge={product.badge}
        />
      ))}
    </div>
  );
}
