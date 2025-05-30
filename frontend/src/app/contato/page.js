'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Instagram, Mail, Phone, Clock, Heart } from 'lucide-react';

export default function ContatoPage() {
  const [contatoData, setContatoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchContatoData = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/contato/", {
          timeout: 5000,
        });
        
        if (!response.data || !response.data.endereco) {
          throw new Error("Dados da API incompletos");
        }
        
        setContatoData({
          ...response.data,
          // Dados adicionais para melhorar a visualização
          telefone: response.data.telefone || "(63)98410-7523",
          email: response.data.email || "Leoneth@loja.com",
          horario_funcionamento: response.data.horario_funcionamento || "Seg-Sex: 9h às 18h"
        });
      } catch (err) {
        console.error("Erro na requisição:", err);
        setError(`Erro ao carregar: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContatoData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto mb-4"></div>
        <p className="text-lg text-amber-800">Carregando informações...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="text-center max-w-md p-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Ocorreu um erro</h2>
        <p className="text-gray-700 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg transition"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-600 to-amber-800 py-20 text-center text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Fale Conosco</h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            Estamos aqui para responder suas dúvidas e receber seu feedback
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'info' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Informações
            </button>
            <button
              onClick={() => setActiveTab('sobre')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'sobre' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Sobre Nós
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-8 md:p-12">
            {activeTab === 'info' ? (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center">
                    <MapPin className="mr-3" /> Nossa Localização
                  </h2>
                  <p className="text-gray-700 mb-6">{contatoData.endereco}</p>
                  
                  <div className="bg-amber-100 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-amber-800 mb-2 flex items-center">
                      <Clock className="mr-2" /> Horário de Funcionamento
                    </h3>
                    <p className="text-gray-700">{contatoData.horario_funcionamento}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Phone className="text-amber-600 mr-3" />
                      <span className="text-gray-700">{contatoData.telefone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="text-amber-600 mr-3" />
                      <span className="text-gray-700">{contatoData.email}</span>
                    </div>
                  </div>
                </div>

                {/* <div>
                  <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center">
                    <Instagram className="mr-3" /> Redes Sociais
                  </h2>
                  <a
                    href={contatoData.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all mb-4"
                  >
                    <Instagram className="mr-2" />
                    Siga-nos no Instagram
                  </a>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Nos envie uma mensagem</h3>
                    <form className="space-y-4">
                      <input
                        type="text"
                        placeholder="Seu nome"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                      <input
                        type="email"
                        placeholder="Seu e-mail"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                      <textarea
                        placeholder="Sua mensagem"
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      ></textarea>
                      <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition"
                      >
                        Enviar Mensagem
                      </button>
                    </form>
                  </div>
                </div> */}
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-amber-800 mb-6 flex items-center">
                  <Heart className="mr-3" /> Nossa História
                </h2>
                <div className="prose max-w-none text-gray-700">
                  <p className="whitespace-pre-line">{contatoData.sobre_loja}</p>
                  
                  <div className="mt-8 bg-amber-50 p-6 rounded-xl border border-amber-200">
                    <h3 className="text-xl font-semibold text-amber-800 mb-4">Nossos Valores</h3>
                    <ul className="space-y-3">
                      <li className="flex items-start">
                        <span className="bg-amber-100 text-amber-800 rounded-full p-1 mr-3">
                          ✓
                        </span>
                        <span>Qualidade em primeiro lugar</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-amber-100 text-amber-800 rounded-full p-1 mr-3">
                          ✓
                        </span>
                        <span>Atendimento personalizado</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-amber-100 text-amber-800 rounded-full p-1 mr-3">
                          ✓
                        </span>
                        <span>Satisfação garantida</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mapa */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-amber-800 mb-4">Onde Estamos</h2>
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
             <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.755025796052!2d-47.634579!3d-5.6021608!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x92c544e39fcdc7f3%3A0xb94e61a911eb0369!2sLEONETH%20MODAS!5e0!3m2!1spt-BR!2sbr!4v1718652341233!5m2!1spt-BR!2sbr"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="rounded-lg"
        ></iframe>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}