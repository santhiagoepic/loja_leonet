"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Produtosmasculino() {
  const [produtos, setProdutos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          "http://127.0.0.1:8000/api/produtos_masculina/"
        );

        if (!response.ok) {
          throw new Error("Falha ao carregar os produtos");
        }

        const data = await response.json();

        setProdutos(data);
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

  // Base URL para as imagens (assumindo que é Cloudinary)
  const imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/";

  return (
    <div className="min-h-screen bg-gray-50 font-bold">
      {/* Header */}
 

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-8">

        <h2 className="text-3xl font-bold text-yellow-600 mb-8">Produtos Masculinos</h2>

        {/* PRIMEIRO PRODUTO*/}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produtos.map((produto) => (
            <div
              key={produto.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-64 w-full">
                <Image
                  src={`${imageBaseUrl}${produto.imagem}`}
                  alt={produto.nome}
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
                    R${" "}
                    {Number.parseFloat(produto.preco)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                  <Link
                    href={produto.link_whatsapp}
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
          ))}

        </div>

      </main>
    </div>
  );
}
