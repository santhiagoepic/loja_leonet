import Link from "next/link";
import ProductCard
from "../produtoscards/produtocards";
export default function CategorySection({ title, produtos, cor, rota, bgClass = "" }) {
  const cores = {
    pink: { text: "text-pink-600", bg: "bg-pink-600", hover: "hover:bg-pink-700" },
    blue: { text: "text-blue-600", bg: "bg-blue-600", hover: "hover:bg-blue-700" },
    purple: { text: "text-purple-600", bg: "bg-purple-600", hover: "hover:bg-purple-700" },
    green: { text: "text-green-600", bg: "bg-green-600", hover: "hover:bg-green-700" }
  };

  return (
    <section className={`py-8 ${bgClass}`}>
      <h2 className={`text-3xl font-bold ${cores[cor].text} mb-6 text-center`}>
        {title}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto">
        {produtos.slice(0, 4).map((produto) => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <Link href={rota}>
          <button className={`${cores[cor].bg} ${cores[cor].hover} text-white px-6 py-2 rounded-full transition-colors`}>
            Ver tudo
          </button>
        </Link>
      </div>
    </section>
  );
}