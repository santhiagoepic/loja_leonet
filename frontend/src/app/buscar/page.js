import Image from "next/image";
import Link from "next/link";
import { apiUrl } from "../../lib/api";
import { buildImageUrl } from "../lib/images";

export const dynamic = "force-dynamic";

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

async function searchProducts(term) {
  const endpoint = `${apiUrl("/api/produtos/")}?search=${encodeURIComponent(term)}`;
  const response = await fetch(endpoint, {
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar os produtos agora. Tente novamente em instantes.");
  }

  return response.json();
}

export default async function BuscarPage({ searchParams }) {
  const query = (searchParams?.q ?? "").toString().trim();
  let produtos = [];
  let error = null;

  if (query) {
    try {
      produtos = await searchProducts(query);
    } catch (err) {
      error = err?.message ?? "Erro inesperado ao buscar produtos.";
    }
  }

  const hasResults = Boolean(produtos?.length);

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-500">
            Digite o nome do produto
          </p>
          <h1 className="mt-3 text-4xl font-black text-gray-900 sm:text-5xl">
            Encontre seu próximo look
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            A busca está conectada ao catálogo completo. Basta escrever o que procura e nós mostramos os resultados na hora.
          </p>
        </header>

        <form action="/buscar" method="get" className="mx-auto flex max-w-3xl flex-col gap-3 rounded-3xl border border-orange-100 bg-white p-4 shadow-xl sm:flex-row">
          <label htmlFor="query" className="sr-only">
            Buscar produtos
          </label>
          <input
            id="query"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Ex.: vestido midi, camiseta masculina, tênis infantil"
            className="flex-1 rounded-2xl border border-transparent bg-orange-50/70 px-5 py-3 text-lg text-gray-800 placeholder-gray-400 outline-none transition focus:border-orange-300 focus:bg-white"
          />
          <button
            type="submit"
            className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:translate-y-0.5 hover:opacity-95"
          >
            Buscar
          </button>
        </form>

        {!query && (
          <p className="mt-10 text-center text-base text-gray-500">
            Use o campo acima para pesquisar por qualquer nome de produto disponível na Leonete Modas.
          </p>
        )}

        {query && (
          <section className="mt-12" aria-live="polite">
            <header className="mb-6 text-center">
              <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Resultado da busca</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900">
                {hasResults
                  ? `${produtos.length} produto${produtos.length > 1 ? "s" : ""} encontrados para "${query}"`
                  : `Nenhum produto encontrado para "${query}"`}
              </h2>
            </header>

            {error && (
              <div className="mx-auto max-w-2xl rounded-2xl border border-red-100 bg-red-50/80 p-6 text-center text-red-700">
                {error}
              </div>
            )}

            {!error && hasResults && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {produtos.map((produto) => (
                  <ResultCard key={produto.id} produto={produto} />
                ))}
              </div>
            )}

            {!error && !hasResults && (
              <p className="text-center text-gray-500">
                Tente usar outro termo ou verificar se a grafia está correta. Estamos sempre atualizando nosso catálogo.
              </p>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function ResultCard({ produto }) {
  if (!produto) return null;

  const image = buildImageUrl(produto.imagem);
  const identifier = produto.slug ?? produto.id;
  const href = identifier ? `/produto/${identifier}` : "#";

  return (
    <Link
      href={href}
      prefetch={false}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-orange-50">
        <Image
          src={image}
          alt={produto.nome ?? "Produto"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {produto.em_destaque && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-orange-500 shadow">
            Destaque
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-orange-400">
          {produto.tipo?.nome ?? produto.tipo_label ?? "Leonete Exclusivo"}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-gray-900 line-clamp-2">{produto.nome}</h3>
        {produto.descricao && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-3">{produto.descricao}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-2xl font-bold text-orange-500">{formatCurrency(produto.preco)}</span>
        </div>
      </div>
    </Link>
  );
}
