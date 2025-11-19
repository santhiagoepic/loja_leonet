"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Banners from "./banners/Banners";
import CategorySection from "./components/CategorySection";
import { apiUrl } from "../lib/api";

// COMPONENTE PRINCIPAL CORRIGIDO
export default function Home() {
  const [categorias, setCategorias] = useState({
    femininos: [],
    masculinos: [],
    acessorios: [],
    infantil: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const imageBaseUrl = "https://res.cloudinary.com/dzlm6jkhv/";

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const endpoints = [
          apiUrl("/api/produtos_feminina/"),
          apiUrl("/api/produtos_masculina/"),
          apiUrl("/api/produtos_acessorios/"),
          apiUrl("/api/produtos_infantil/")
        ];

        const responses = await Promise.all(
          endpoints.map(url => fetch(url).then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          }))
        );

        setCategorias({
          femininos: responses[0],
          masculinos: responses[1],
          acessorios: responses[2],
          infantil: responses[3]
        });
      } catch (err) {
        setError("Erro ao carregar produtos. Por favor, tente novamente mais tarde.");
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  // Função para redirecionar para WhatsApp
  const handleWhatsApp = (produto) => {
    const phoneNumber = "5563984107523";
    
    const nomeProduto = produto.nome || "Produto";
    const descricao = produto.descricao || "Sem descrição disponível";
    const preco = Number.parseFloat(produto.preco).toFixed(2).replace(".", ",");
    
    const message = `🛍️ *INTERESSE NO PRODUTO* 🛍️

*Produto:* ${nomeProduto}
*Descrição:* ${descricao}
*Preço:* R$ ${preco}

Olá! Gostaria de mais informações sobre este produto. Poderia me informar:
• Cores disponíveis
• Tamanhos
• Condições de pagamento
• Prazo de entrega

Aguardo seu retorno! 😊`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Banners />

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin h-12 w-12 text-orange-500" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500 text-lg">{error}</p>
          </div>
        ) : (
          <div className="space-y-16">
            <CategorySection
              category="feminino"
              title="Produtos Femininos"
              produtos={categorias.femininos}
              onWhatsApp={handleWhatsApp}
              imageBaseUrl={imageBaseUrl}
            />
            
            <CategorySection
              category="masculino"
              title="Produtos Masculinos"
              produtos={categorias.masculinos}
              onWhatsApp={handleWhatsApp}
              imageBaseUrl={imageBaseUrl}
            />
            
            <CategorySection
              category="acessorios"
              title="Acessórios"
              produtos={categorias.acessorios}
              onWhatsApp={handleWhatsApp}
              imageBaseUrl={imageBaseUrl}
            />
            
            <CategorySection
              category="infantil"
              title="Infantil"
              produtos={categorias.infantil}
              onWhatsApp={handleWhatsApp}
              imageBaseUrl={imageBaseUrl}
            />
          </div>
        )}
      </main>
    </div>
  );
}