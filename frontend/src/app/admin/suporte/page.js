"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAdminGuard } from "../useAdminGuard";
import { CheckCircle2, Inbox, Loader2, Send, Paperclip } from "lucide-react";

const statusOptions = [
  { value: "aberto", label: "Aberto" },
  { value: "em_andamento", label: "Em andamento" },
  { value: "encerrado", label: "Encerrado" },
];

function statusPill(status) {
  switch (status) {
    case "em_andamento":
      return "bg-amber-100 text-amber-800";
    case "encerrado":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

export default function AdminSuportePage() {
  const { ready, request } = useAdminGuard();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [reply, setReply] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [status, setStatus] = useState("aberto");
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const data = await request("/api/suporte/");
        setTickets(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os chamados.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [ready, request]);

  const selected = useMemo(() => tickets.find((item) => item.id === selectedId), [tickets, selectedId]);

  useEffect(() => {
    if (!selected && tickets.length) {
      setSelectedId(tickets[0].id);
    }
  }, [tickets, selected]);

  useEffect(() => {
    if (selected) {
      setReply("");
      setAttachment(null);
      setStatus(selected.status || "aberto");
    }
  }, [selected]);

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await request(`/api/suporte/${selected.id}/`, {
        method: "PATCH",
        body: {
          status,
          produto_nome: selected.produto_nome,
        },
      });
      setTickets((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao salvar resposta.");
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!selected) return;
    if (!reply && !attachment) return;
    setSending(true);
    try {
      const formData = new FormData();
      if (reply) formData.append("texto", reply);
      if (attachment) formData.append("imagem", attachment);

      const message = await request(`/api/suporte/${selected.id}/mensagens/`, {
        method: "POST",
        body: formData,
      });

      setTickets((prev) =>
        prev.map((item) =>
          item.id === selected.id
            ? { ...item, mensagens: [...(item.mensagens || []), message] }
            : item
        )
      );
      setReply("");
      setAttachment(null);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Erro ao enviar mensagem.");
    } finally {
      setSending(false);
    }
  };

  if (!ready) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Suporte</p>
          <h1 className="text-3xl font-bold text-slate-900">Chamados e respostas</h1>
          <p className="text-sm text-slate-500">Acompanhe os tickets abertos pelos clientes e responda diretamente.</p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-600"
        >
          Voltar para o painel
        </Link>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Chamados</p>
              <p className="text-lg font-semibold text-slate-900">{tickets.length} registros</p>
            </div>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />}
          </header>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-slate-500">
              <Inbox className="h-8 w-8" />
              <p>Nenhum chamado aberto.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className={`flex cursor-pointer gap-4 px-4 py-3 transition hover:bg-slate-50 ${
                    selectedId === ticket.id ? "bg-emerald-50/60" : "bg-white"
                  }`}
                  onClick={() => setSelectedId(ticket.id)}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusPill(ticket.status)}`}>
                        {statusOptions.find((opt) => opt.value === ticket.status)?.label || "Aberto"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{ticket.tipo_suporte}</span>
                      {ticket.produto_nome && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {ticket.produto_nome}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900 line-clamp-2">{ticket.mensagem}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {ticket.usuario?.email ? `Cliente: ${ticket.usuario.email}` : "Cliente"} ·
                      {" "}
                      {ticket.created_at ? new Date(ticket.created_at).toLocaleString("pt-BR") : "Recém criado"}
                    </p>
                    {ticket.resposta && (
                      <p className="mt-1 line-clamp-1 text-xs text-emerald-600">Resposta: {ticket.resposta}</p>
                    )}
                  </div>
                  <CheckCircle2
                    className={`h-5 w-5 ${ticket.resposta ? "text-emerald-600" : "text-slate-200"}`}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {selected ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Chamado</p>
                <h2 className="text-xl font-semibold text-slate-900">{selected.tipo_suporte}</h2>
                <p className="text-sm text-slate-600">{selected.mensagem}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {selected.produto_nome ? `Produto: ${selected.produto_nome} · ` : ""}
                  {selected.created_at ? new Date(selected.created_at).toLocaleString("pt-BR") : "Recém criado"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div className="flex gap-2">
                  <select
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-200"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {saving ? "Salvando..." : "Atualizar status"}
                  </button>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800">Mensagens</p>
                  <span className="text-xs text-slate-500">{(selected.mensagens || []).length} itens</span>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {(selected.mensagens || []).length ? (
                    (selected.mensagens || []).map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-lg border px-3 py-2 text-sm shadow-sm ${
                          msg.tipo_autor === "admin"
                            ? "border-emerald-100 bg-emerald-50/70 text-emerald-900"
                            : "border-slate-200 bg-white text-slate-800"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="font-semibold">{msg.tipo_autor === "admin" ? "Você" : "Cliente"}</span>
                          <span>{msg.created_at ? new Date(msg.created_at).toLocaleString("pt-BR") : ""}</span>
                        </div>
                        {msg.texto && <p className="mt-1 whitespace-pre-wrap text-sm">{msg.texto}</p>}
                        {msg.imagem && (
                          <div className="mt-2 overflow-hidden rounded-md border border-slate-200">
                            <img src={msg.imagem} alt="Anexo" className="h-40 w-full object-cover" />
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-500">Sem mensagens ainda.</p>
                  )}
                </div>

                <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                  <textarea
                    rows={3}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-emerald-200"
                    placeholder="Escreva uma mensagem para o cliente..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                    <Paperclip className="h-4 w-4" />
                    <span>Anexar imagem (opcional)</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                    />
                    {attachment && <span className="text-xs text-slate-500">{attachment.name}</span>}
                  </label>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {sending ? "Enviando..." : "Enviar mensagem"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center text-slate-500">
              <p>Selecione um chamado para responder.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
