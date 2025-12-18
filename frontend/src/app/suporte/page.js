'use client';
import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Clock3, ChevronRight, CheckCircle2, Paperclip } from 'lucide-react';
import { loadViewHistory } from '../lib/view-history';
import { useAuth } from '../providers/auth-context';

const initialForm = () => ({
  mensagem: '',
  tipo_suporte: 'Dúvida',
  produto_nome: '',
  produto_id: '',
});

const statusColor = {
  aberto: 'bg-emerald-100 text-emerald-700',
  em_andamento: 'bg-amber-100 text-amber-700',
  encerrado: 'bg-slate-100 text-slate-700',
};

const statusLabel = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  encerrado: 'Encerrado',
};

export default function SuportePage() {
  const { user, loading: authLoading, request } = useAuth();
  const [supportList, setSupportList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(initialForm());
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [replyState, setReplyState] = useState({});

  useEffect(() => {
    setHistory(loadViewHistory());
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await request('/api/suporte/');
        setSupportList(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Não foi possível carregar seus chamados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authLoading, user, request]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    if (field === 'produto_nome') {
      setForm((prev) => ({ ...prev, produto_nome: value, produto_id: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      const payload = {
        mensagem: form.mensagem,
        tipo_suporte: form.tipo_suporte,
        produto_nome: form.produto_nome || undefined,
      };
      if (form.produto_id) {
        payload.produto_id = form.produto_id;
      }
      const created = await request('/api/suporte/', {
        method: 'POST',
        body: payload,
      });
      setSupportList((prev) => [created, ...prev]);
      setForm(initialForm());
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao abrir chamado.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyChange = (ticketId, field) => (event) => {
    const value = field === 'file' ? event.target.files?.[0] || null : event.target.value;
    setReplyState((prev) => ({
      ...prev,
      [ticketId]: {
        ...(prev[ticketId] || {}),
        [field]: value,
      },
    }));
  };

  const handleReplySubmit = async (ticketId, status) => {
    if (status !== 'em_andamento') return;
    const state = replyState[ticketId] || {};
    if (!state.text && !state.file) return;

    setReplyState((prev) => ({
      ...prev,
      [ticketId]: { ...(prev[ticketId] || {}), sending: true, error: null },
    }));

    try {
      const formData = new FormData();
      if (state.text) formData.append('texto', state.text);
      if (state.file) formData.append('imagem', state.file);

      const message = await request(`/api/suporte/${ticketId}/mensagens/`, {
        method: 'POST',
        body: formData,
      });

      setSupportList((prev) =>
        prev.map((item) =>
          item.id === ticketId
            ? { ...item, mensagens: [...(item.mensagens || []), message] }
            : item
        )
      );

      setReplyState((prev) => ({
        ...prev,
        [ticketId]: { text: '', file: null, sending: false, error: null },
      }));
    } catch (err) {
      setReplyState((prev) => ({
        ...prev,
        [ticketId]: { ...(prev[ticketId] || {}), sending: false, error: err.message || 'Erro ao responder.' },
      }));
    }
  };

  const handleHistorySelect = (event) => {
    const value = event.target.value;
    if (!value) {
      setForm((prev) => ({ ...prev, produto_id: '', produto_nome: '' }));
      return;
    }
    const selected = history.find((item) => String(item.id) === value);
    if (selected) {
      setForm((prev) => ({ ...prev, produto_id: selected.id, produto_nome: selected.name }));
    }
  };

  const metrics = useMemo(() => {
    if (!supportList.length) {
      return { total: 0, ultimo: null };
    }
    const [maisRecente] = supportList;
    return {
      total: supportList.length,
      ultimo: maisRecente?.created_at || null,
    };
  }, [supportList]);

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-10 shadow-lg">
          <h1 className="text-3xl font-semibold text-slate-900">Faça login para acessar o suporte</h1>
          <p className="mt-4 text-slate-500">
            Seus chamados ficam vinculados à sua conta. Entre ou crie um cadastro para continuar o atendimento com segurança.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <header className="bg-gradient-to-br from-emerald-600 to-emerald-500 py-16 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 lg:flex-row lg:items-center">
          <div className="flex-1">
            <p className="uppercase tracking-[0.25em] text-emerald-100">Central do cliente</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight md:text-5xl">Olá, {user.full_name || user.email}</h1>
            <p className="mt-4 text-lg text-emerald-50">
              Abra chamados, acompanhe as respostas e mantenha um histórico organizado de todo o seu suporte em um só lugar.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-2 gap-4 text-center">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-wide text-emerald-50">Chamados</p>
              <p className="text-4xl font-semibold">{metrics.total}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur">
              <p className="text-sm uppercase tracking-wide text-emerald-50">Último registro</p>
              <p className="text-lg font-semibold">
                {metrics.ultimo ? new Date(metrics.ultimo).toLocaleDateString('pt-BR') : '—'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-emerald-500">Histórico</p>
                <h2 className="text-2xl font-semibold text-slate-900">Meus chamados</h2>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500" />
              </div>
            ) : supportList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-emerald-500" />
                <h3 className="mt-4 text-lg font-semibold text-slate-900">Nenhum chamado por aqui</h3>
                <p className="mt-2 text-slate-500">Abra um chamado no painel ao lado e ele aparecerá imediatamente nesta lista.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {supportList.map((ticket) => (
                  <li key={ticket.id} className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[ticket.status || 'aberto'] || 'bg-slate-100 text-slate-600'}`}>
                        {statusLabel[ticket.status || 'aberto'] || 'Aberto'}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{ticket.tipo_suporte}</span>
                          {ticket.produto_nome && <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Produto: {ticket.produto_nome}</span>}
                        </div>
                        <p className="mt-2 text-base font-medium text-slate-900">{ticket.mensagem}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-4 w-4" />
                            {ticket.created_at ? new Date(ticket.created_at).toLocaleString('pt-BR') : 'Recém criado'}
                          </span>
                        </div>

                        <div className="mt-4 space-y-3">
                          {(ticket.mensagens || []).length ? (
                            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                              {(ticket.mensagens || []).map((msg) => (
                                <div key={msg.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${msg.tipo_autor === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                      {msg.tipo_autor === 'admin' ? 'Loja' : 'Você'}
                                    </span>
                                    <span>{msg.created_at ? new Date(msg.created_at).toLocaleString('pt-BR') : ''}</span>
                                  </div>
                                  {msg.texto && <p className="mt-1 text-sm text-slate-800 whitespace-pre-wrap">{msg.texto}</p>}
                                  {msg.imagem && (
                                    <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
                                      <img src={msg.imagem} alt="Imagem do chamado" className="h-48 w-full object-cover" />
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">Nenhuma conversa registrada ainda.</p>
                          )}

                          {ticket.status === 'em_andamento' && (
                            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 space-y-2">
                              <p className="text-sm font-semibold text-amber-800">Responder loja</p>
                              <textarea
                                rows={3}
                                className="w-full rounded-lg border border-amber-200 px-3 py-2 text-sm focus:border-amber-400 focus:ring-amber-200"
                                placeholder="Digite sua resposta..."
                                value={replyState[ticket.id]?.text || ''}
                                onChange={handleReplyChange(ticket.id, 'text')}
                              />
                              <label className="flex cursor-pointer items-center gap-2 text-sm text-amber-800">
                                <Paperclip className="h-4 w-4" />
                                <span>Adicionar imagem (opcional)</span>
                                <input type="file" accept="image/*" className="hidden" onChange={handleReplyChange(ticket.id, 'file')} />
                                {replyState[ticket.id]?.file && (
                                  <span className="text-xs text-amber-700">{replyState[ticket.id].file.name}</span>
                                )}
                              </label>
                              {replyState[ticket.id]?.error && (
                                <p className="text-xs text-red-600">{replyState[ticket.id].error}</p>
                              )}
                              <button
                                type="button"
                                onClick={() => handleReplySubmit(ticket.id, ticket.status)}
                                disabled={replyState[ticket.id]?.sending}
                                className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-60"
                              >
                                {replyState[ticket.id]?.sending ? 'Enviando...' : 'Enviar resposta'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 transition group-hover:text-emerald-500" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <aside className="rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-lg">
            <p className="text-sm uppercase tracking-wide text-emerald-500">Abertura rápida</p>
            <h2 className="text-2xl font-semibold text-slate-900">Registrar novo chamado</h2>
            <p className="mt-1 text-sm text-slate-500">Descreva com detalhes o que precisa e retornaremos o mais rápido possível.</p>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="tipo_suporte">
                  Tipo do atendimento
                </label>
                <select
                  id="tipo_suporte"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:ring-emerald-200"
                  value={form.tipo_suporte}
                  onChange={handleChange('tipo_suporte')}
                >
                  <option value="Dúvida">Dúvida</option>
                  <option value="Troca">Troca</option>
                  <option value="Devolução">Devolução</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="mensagem">
                  Descreva sua solicitação
                </label>
                <textarea
                  id="mensagem"
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:ring-emerald-200"
                  value={form.mensagem}
                  onChange={handleChange('mensagem')}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="produto_nome">
                  Produto (opcional)
                </label>
                <div className="space-y-3 rounded-2xl border border-slate-200 p-4">
                  <div className="space-y-2">
                    <p className="text-xs text-slate-500">Use o nome do produto para sabermos sobre o que se trata.</p>
                    <input
                      id="produto_nome"
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:ring-emerald-200"
                      placeholder="Ex: Tênis Volt Hyper"
                      value={form.produto_nome}
                      onChange={handleChange('produto_nome')}
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Visualizações no WhatsApp</span>
                      <span className="text-xs text-slate-500">{history.length ? `${history.length} itens` : 'Vazio'}</span>
                    </div>
                    <select
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-400 focus:ring-emerald-200"
                      value={form.produto_id || ''}
                      onChange={handleHistorySelect}
                    >
                      <option value="">Selecionar pelo histórico</option>
                      {history.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-emerald-600 py-3 text-center text-white font-semibold transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Enviando...' : 'Abrir chamado'}
              </button>
            </form>
          </aside>
        </div>
      </main>
    </div>
  );
}