"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Banners from "./banners/Banners";

export default function Home() {
  const [femininos, setFemininos] = useState([]);
  const [masculinos, setMasculinos] = useState([]);
  const [acessorios, setAcessorios] = useState([]);
  const [infantil, setInfantil] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({
    feminino: false,
    masculino: false,
    acessorios: false,
    infantil: false,
  });

  const toggleExpand = (category) => {
    setExpanded((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true);

        const [resFeminino, resMasculino, resAcessorios, resInfantil] =
          await Promise.all([
            fetch("http://127.0.0.1:8000/api/produtos_feminina/"),
            fetch("http://127.0.0.1:8000/api/produtos_masculina/"),
            fetch("http://127.0.0.1:8000/api/produtos_acessorios/"),
            fetch("http://127.0.0.1:8000/api/produtos_infantil/"),
          ]);

        if (
          !resFeminino.ok ||
          !resMasculino.ok ||
          !resAcessorios.ok ||
          !resInfantil.ok
        ) {
          throw new Error("Falha ao carregar os produtos");
        }

        const [dataFeminino, dataMasculino, dataAcessorios, dataInfantil] =
          await Promise.all([
            resFeminino.json(),
            resMasculino.json(),
            resAcessorios.json(),
            resInfantil.json(),
          ]);

        console.log(dataFeminino);
        console.log(dataMasculino);
        console.log(dataAcessorios);
        console.log(dataInfantil);

        setFemininos(dataFeminino);
        setMasculinos(dataMasculino);
        setAcessorios(dataAcessorios);
        setInfantil(dataInfantil);
      } catch (err) {
        setError(
          "Erro ao carregar produtos. Por favor, tente novamente mais tarde."
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/";

  const renderProductCard = (produto, index) => (
    <div
      key={index}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-64 w-full">
        <Image
          src={`${imageBaseUrl}${produto.imagem}`}
          alt={produto.nome ? produto.nome : "Produto"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {produto.em_destaque && (
          <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">
            Destaque
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {produto.nome}
        </h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {produto.descricao}
        </p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-xl font-bold text-pink-600">
            R$ {Number.parseFloat(produto.preco).toFixed(2).replace(".", ",")}
          </span>
          <Link
            href={produto.link_whatsapp ? produto.link_whatsapp : "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition duration-200">
              Comprar
            </button>
          </Link>
        </div>
      </div>
    </div>
  );

  const renderCategorySection = (category, title, colorClass) => {
    const categorias = {
      feminino: femininos,
      masculino: masculinos,
      acessorios: acessorios,
      infantil: infantil,
    }[category];

    if (!categorias || categorias.length === 0) return null;

    return (
      <section className="mb-12" key={category}>
        <h2 className={`text-3xl font-bold ${colorClass} mb-8`}>{title}</h2>

        {categorias.map((grupo, i) => (
          <div key={i} className="mb-8">
            <h3 className="text-2xl font-semibold mb-4">{grupo.tipo}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {grupo.produtos.map((produto, index) =>
                renderProductCard(produto, `${i}-${index}`)
              )}
            </div>
          </div>
        ))}
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-bold">
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">
        <Banners />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin h-8 w-8 text-yellow-600" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center py-12">{error}</p>
        ) : (
          <>
            {renderCategorySection(
              "feminino",
              "Produtos Femininos",
              "text-yellow-600"
            )}
            {renderCategorySection(
              "masculino",
              "Produtos Masculinos",
              "text-blue-600"
            )}
            {renderCategorySection(
              "acessorios",
              "Acessórios",
              "text-purple-600"
            )}
            {renderCategorySection("infantil", "Infantil", "text-green-600")}
          </>
        )}
      </main>
    </div>
  );
}
