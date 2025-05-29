'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Instagram } from 'lucide-react';

export default function ContatoPage() {
  const [contatoData, setContatoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContatoData = async () => {
      try {
        // Adicione um timeout para evitar espera infinita
        const response = await axios.get('http://127.0.0.1:8000/api/contato/', {
          timeout: 5000
        });
        
        // Verifica se a resposta tem os dados mínimos esperados
        if (!response.data || !response.data.endereco) {
          throw new Error('Dados da API incompletos');
        }
        
        setContatoData(response.data);
      } catch (err) {
        console.error('Erro na requisição:', err);
        setError(`Erro ao carregar: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContatoData();
  }, []);

  if (loading) return (
    <div className="text-center py-20">
      <p>Carregando informações de contato...</p>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-red-500">
      <p>{error}</p>
      <p className="mt-4 text-sm text-gray-600">
        Tente recarregar a página ou volte mais tarde.
      </p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Contato</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Informações</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <MapPin className="h-5 w-5 mt-1 mr-3 text-amber-600" />
              <div>
                <h3 className="font-medium">Endereço</h3>
                <p className="text-gray-600">{contatoData.endereco}</p>
              </div>
            </div>

            <div className="flex items-start">
              <Instagram className="h-5 w-5 mt-1 mr-3 text-amber-600" />
              <div>
                <h3 className="font-medium">Instagram</h3>
                <a 
                  href={contatoData.instagram} 
                  target="_blank"
                  rel="noopener"
                  className="text-blue-600 hover:underline"
                >
                  {contatoData.instagram.replace('https://www.instagram.com/', '@')}
                </a>
              </div>
            </div>
          </div>
        </div>

        {contatoData.sobre_loja && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Sobre a Loja</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {contatoData.sobre_loja}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}