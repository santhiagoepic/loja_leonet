"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { MapPin, Instagram } from "lucide-react";

export default function ContatoPage() {
  const [contatoData, setContatoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContatoData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/contato/", {
          timeout: 5000,
        });
        if (!response.data || !response.data.endereco) {
          throw new Error("Dados da API incompletos");
        }
        setContatoData(response.data);
      } catch (err) {
        console.error("Erro na requisição:", err);
        setError(`Erro ao carregar: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContatoData();
  }, []);

  if (loading)
    return (
      <div className="text-center py-20">
        <p className="text-lg text-gray-700 animate-pulse">
          Carregando informações de contato...
        </p>
      </div>
    );

  if (error)
    return (
      <div className="text-center py-20 text-red-500">
        <p className="text-xl font-semibold">{error}</p>
        <p className="mt-4 text-sm text-gray-600">
          Tente recarregar a página ou volte mais tarde.
        </p>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-extrabold text-center text-amber-600 mb-12">
        Entre em Contato
      </h1>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2 border-amber-500">
            Informações
          </h2>

          <div className="space-y-6">
            <div className="flex items-start">
              <MapPin className="h-6 w-6 mt-1 mr-4 text-amber-600" />
              <div>
                <h3 className="font-semibold text-gray-700">Endereço</h3>
                <p className="text-gray-600">{contatoData.endereco}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Instagram className="h-6 w-6 mt-1 mr-4 text-pink-500" />
              <div>
                <h3 className="font-semibold text-gray-700">Instagram</h3>
                <a
                  href={contatoData.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-1 bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition"
                >
                  {contatoData.instagram.replace(
                    "https://www.instagram.com/",
                    "@"
                  )}
                </a>
              </div>
            </div>
          </div>
        </div>

        {contatoData.sobre_loja && (
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2 border-amber-500">
              Sobre a Loja
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {contatoData.sobre_loja}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
