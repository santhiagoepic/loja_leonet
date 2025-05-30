'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Phone, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export default function SuportePage() {
  const [suportes, setSuportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    mensagem: '',
    tipo_suporte: 'Dúvida',
    contato: '',
    telefone: '',
    email: '',
    produto: ''
  });

  // Busca os chamados de suporte
  useEffect(() => {
    const fetchSuportes = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/suporte/');
        setSuportes(response.data);
      } catch (err) {
        setError('Erro ao carregar chamados de suporte');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuportes();
  }, []);

  // Manipulador de envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/suporte/', formData);
      setSuportes([...suportes, response.data]);
      setFormData({
        mensagem: '',
        tipo_suporte: 'Dúvida',
        contato: '',
        telefone: '',
        email: '',
        produto: ''
      });
      alert('Chamado aberto com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao abrir chamado');
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return (
    <div  className="flex justify-center items-center h-screen bg-amber-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 bg-amber-50">
      <p className="text-red-500">{error}</p>
    </div>
  );

  return (
    <div className="text-yellow-600 min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-amber-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Central de Suporte</h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            Estamos aqui para ajudar com qualquer dúvida ou problema
          </p>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className=" container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Formulário de Suporte */}
          <div className="bg-white rounded-lg shadow-lg p-8 border border-amber-200">
            <h2 className="text-2xl font-bold text-amber-800 mb-6">Abrir Novo Chamado</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="tipo_suporte" className="block text-amber-800 font-medium mb-2">
                  Tipo de Suporte
                </label>
                <select
                  id="text-yellow-600 tipo_suporte"
                  value={formData.tipo_suporte}
                  onChange={(e) => setFormData({...formData, tipo_suporte: e.target.value})}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                >
                  <option value="Dúvida">Dúvida</option>
                  <option value="Troca">Troca</option>
                  <option value="Devolução">Devolução</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label htmlFor="mensagem" className="block text-amber-800 font-medium mb-2">
                  Mensagem
                </label>
                <textarea
                  id="mensagem"
                  rows="4"
                  value={formData.mensagem}
                  onChange={(e) => setFormData({...formData, mensagem: e.target.value})}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Descreva seu problema ou dúvida"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contato" className="block text-amber-800 font-medium mb-2">
                    Seu Nome
                  </label>
                  <input
                    type="text"
                    id="contato"
                    value={formData.contato}
                    onChange={(e) => setFormData({...formData, contato: e.target.value})}
                    className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-amber-800 font-medium mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-amber-800 font-medium mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="produto" className="block text-amber-800 font-medium mb-2">
                  ID do Produto (se aplicável)
                </label>
                <input
                  type="text"
                  id="produto"
                  value={formData.produto}
                  onChange={(e) => setFormData({...formData, produto: e.target.value})}
                  className="w-full px-4 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300"
              >
                Enviar Solicitação
              </button>
            </form>
          </div>

          {/* Lista de Chamados */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-amber-800 mb-6">Seus Chamados Recentes</h2>
            
            {suportes.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-600">Nenhum chamado encontrado</p>
              </div>
            ) : (
              suportes.map((suporte) => (
                <div 
                  key={suporte.id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-amber-200"
                >
                  <div 
                    className="p-4 flex justify-between items-center cursor-pointer"
                    onClick={() => toggleExpand(suporte.id)}
                  >
                    <div>
                      <h3 className="font-semibold text-amber-800">{suporte.tipo_suporte}</h3>
                      <p className="text-sm text-gray-600 truncate">{suporte.mensagem}</p>
                    </div>
                    {expandedId === suporte.id ? (
                      <ChevronUp className="text-amber-600" />
                    ) : (
                      <ChevronDown className="text-amber-600" />
                    )}
                  </div>
                  
                  {expandedId === suporte.id && (
                    <div className="p-4 border-t border-amber-100">
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <MessageSquare className="h-5 w-5 text-amber-600 mt-1 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-800">Mensagem</h4>
                            <p className="text-gray-600">{suporte.mensagem}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Phone className="h-5 w-5 text-amber-600 mt-1 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-800">Contato</h4>
                            <p className="text-gray-600">{suporte.contato} - {suporte.telefone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <Mail className="h-5 w-5 text-amber-600 mt-1 mr-3" />
                          <div>
                            <h4 className="font-medium text-gray-800">E-mail</h4>
                            <p className="text-gray-600">{suporte.email}</p>
                          </div>
                        </div>
                        
                        {suporte.produto && (
                          <div>
                            <h4 className="font-medium text-gray-800">Produto Relacionado</h4>
                            <p className="text-gray-600">ID: {suporte.produto}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}