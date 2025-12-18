"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Banners from "./banners/Banners";
import CategorySection from "./components/CategorySection";
import WhatsAppFeedbackCard from "./components/WhatsAppFeedbackCard";
import { apiUrl } from "../lib/api";
import { contactStoreViaWhatsApp, buildWarningFeedback, openWhatsApp } from "./lib/whatsapp";
import { recordWhatsAppView } from "./lib/view-history";
import { useAuth } from "./providers/auth-context";

// COMPONENTE PRINCIPAL CORRIGIDO
export default function Home() {
  const router = useRouter();
  const { user, request, loading: authLoading } = useAuth();
  const [categorias, setCategorias] = useState({
    femininos: [],
    masculinos: [],
    acessorios: [],
    infantil: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingProductId, setPendingProductId] = useState(null);
  const [whatsAppFeedback, setWhatsAppFeedback] = useState(null);

  const emitFeedback = (payload) => {
    if (!payload) {
      setWhatsAppFeedback(null);
      return;
    }
    setWhatsAppFeedback({ ...payload, id: Date.now() });
  };

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
  const redirectToLogin = () => {
    const target = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/";
    router.push(`/auth/login?redirect=${encodeURIComponent(target)}`);
  };

  const handleWhatsApp = async (produto) => {
    if (!produto) return;

    if (!user) {
      if (authLoading) {
        return;
      }
      redirectToLogin();
      return;
    }

    if (!user.phone_number) {
      emitFeedback(buildWarningFeedback("Precisamos do seu telefone com DDD para enviar os detalhes."));
      router.push("/conta");
      return;
    }

    recordWhatsAppView(produto);
    setPendingProductId(produto.id);
    try {
      const result = await contactStoreViaWhatsApp(produto, { requestFn: request });
      emitFeedback(result.feedback);
      openWhatsApp(produto);
    } catch (err) {
      emitFeedback({ status: "error", title: "Não conseguimos enviar", message: err.message || "Tente novamente em instantes." });
    } finally {
      setPendingProductId(null);
    }
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
              busyProductId={pendingProductId}
              imageBaseUrl={imageBaseUrl}
            />
            
            <CategorySection
              category="masculino"
              title="Produtos Masculinos"
              produtos={categorias.masculinos}
              onWhatsApp={handleWhatsApp}
              busyProductId={pendingProductId}
              imageBaseUrl={imageBaseUrl}
            />
            
            <CategorySection
              category="acessorios"
              title="Acessórios"
              produtos={categorias.acessorios}
              onWhatsApp={handleWhatsApp}
              busyProductId={pendingProductId}
              imageBaseUrl={imageBaseUrl}
            />
            
            <CategorySection
              category="infantil"
              title="Infantil"
              produtos={categorias.infantil}
              onWhatsApp={handleWhatsApp}
              busyProductId={pendingProductId}
              imageBaseUrl={imageBaseUrl}
            />
          </div>
        )}
      </main>
      <WhatsAppFeedbackCard feedback={whatsAppFeedback} onClose={() => emitFeedback(null)} />
    </div>
  );
}