"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import CategorySection from "./CategorySection";
import WhatsAppFeedbackCard from "./WhatsAppFeedbackCard";
import { apiUrl } from "../../lib/api";
import { contactStoreViaWhatsApp, buildWarningFeedback, openWhatsApp } from "../lib/whatsapp";
import { recordWhatsAppView } from "../lib/view-history";
import { useAuth } from "../providers/auth-context";

export default function CategoryPageTemplate({ endpoint, category, title }) {
  const router = useRouter();
  const { user, request, loading: authLoading } = useAuth();
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
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
      emitFeedback(buildWarningFeedback("Informe um telefone válido em Minha Conta."));
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
      emitFeedback({ status: "error", title: "Não conseguimos enviar", message: err.message || "Tente novamente em breve." });
    } finally {
      setPendingProductId(null);
    }
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
            busyProductId={pendingProductId}
            showSeeAll={false}
          />
        )}
        <WhatsAppFeedbackCard feedback={whatsAppFeedback} onClose={() => emitFeedback(null)} />
      </div>
    </div>
  );
}
