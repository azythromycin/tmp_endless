"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Sparkles, LineChart, Target, Building } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: { account_count?: number; journal_count?: number };
}

const sanitize = (text: string) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*/g, '')
    .trim();

const quickPrompts = [
  "Give me a cash flow outlook for next month",
  "Break down my top three expense categories",
  "How balanced are my debits vs credits right now?"
];

export default function AIConsolePage() {
  const { company } = useAuth();
  const companyId = company?.id || null;
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [insightMeta, setInsightMeta] = useState<{ accounts?: number; journals?: number }>({});

  const handleAsk = async () => {
    if (!query.trim() || !companyId) return;

    const userMessage: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setLoading(true);

    try {
      const resp = await api.post<{ answer: string; account_count: number; journal_count: number }>(
        "/ai/query",
        {
          company_id: companyId,
          question: userMessage.content,
        }
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: sanitize(resp.answer),
        metadata: {
          account_count: resp.account_count,
          journal_count: resp.journal_count,
        }
      };
      setInsightMeta({ accounts: resp.account_count, journals: resp.journal_count });
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      let errorMsg = 'Unknown error';
      if (err.response?.data?.detail) {
        errorMsg = typeof err.response.data.detail === 'string'
          ? err.response.data.detail
          : JSON.stringify(err.response.data.detail);
      } else if (err.message) {
        errorMsg = err.message;
      }

      const errorMessage: Message = {
        role: 'assistant',
        content: sanitize(
          errorMsg.includes("OPENAI_API_KEY")
            ? "AI assistant requires an OpenAI API key on the backend."
            : `Sorry, I encountered an error: ${errorMsg}`
        )
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const companyBlocked = !companyId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-8 space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
              <Sparkles className="w-4 h-4 text-fuchsia-300" /> Endless Copilot
            </div>
            <h1 className="text-3xl font-semibold mt-2 text-white">Modern AI finance console</h1>
            <p className="text-sm text-white/70 mt-1">Ask anything about your ledgers, get perspective instantly.</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-white/60 text-xs uppercase tracking-wide">Accounts</p>
              <p className="text-2xl font-semibold">{insightMeta.accounts ?? '—'}</p>
            </div>
            <div className="px-4 py-3 rounded-2xl border border-white/10 bg-white/5">
              <p className="text-white/60 text-xs uppercase tracking-wide">Journal Entries</p>
              <p className="text-2xl font-semibold">{insightMeta.journals ?? '—'}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => setQuery(prompt)}
              className="px-4 py-2 text-sm rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 backdrop-blur-xl overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <label className="text-xs font-semibold uppercase tracking-widest text-white/60">Prompt Endless AI</label>
            <div className="mt-3 flex flex-col gap-3">
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm min-h-[110px] focus:outline-none focus:ring-2 focus:ring-fuchsia-500/60 placeholder:text-white/40"
                rows={3}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
                placeholder="What signal would you like to uncover?"
                disabled={companyBlocked}
              />
              {companyBlocked && (
                <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-2 inline-flex items-center gap-2">
                  <Target className="w-4 h-4" /> Waiting for demo company to load. Seed data to begin.
                </div>
              )}
              <div className="flex justify-between items-center">
                <p className="text-xs text-white/40">Cmd/Ctrl + Enter to submit</p>
                <button
                  onClick={handleAsk}
                  disabled={loading || !query.trim() || companyBlocked}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-sm font-medium tracking-wide disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_10px_35px_rgba(129,80,255,0.4)]"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading ? "Thinking..." : "Generate insight"}
                </button>
              </div>
            </div>
          </div>

          <div className="h-[420px] overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center text-center text-white/60 h-full">
                <LineChart className="w-12 h-12 text-fuchsia-300 mb-4" />
                <p className="max-w-sm">
                  Ask about burn, runway, vendor spend, anomalies, or anything else. I'll blend ledger data with real-time benchmarks.
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-2xl rounded-3xl px-5 py-4 text-sm leading-relaxed shadow-xl ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-fuchsia-500/80 to-indigo-500/80 text-white'
                      : 'bg-white/6 border border-white/10 text-slate-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.metadata && (
                    <div className="text-xs mt-3 text-white/60">
                      Based on {msg.metadata.account_count?.toLocaleString() ?? '—'} accounts • {msg.metadata.journal_count?.toLocaleString() ?? '—'} journal entries
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex items-center gap-2 text-sm text-white/60">
                  <Loader2 className="w-4 h-4 animate-spin" /> Crunching the numbers...
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <Building className="w-5 h-5 text-fuchsia-300" />
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Company</p>
                <p className="text-lg font-semibold text-white">{company?.name || 'Demo Company'}</p>
              </div>
            </div>
            <p className="text-sm text-white/70">
              Endless Copilot reads your Supabase data live. Every response blends your ledger with peer benchmarks so you always have context.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-900/80 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-widest">Power tips</h3>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Ask for summaries plus next actions.</li>
              <li>Reference specific accounts or vendors for precision.</li>
              <li>Combine metrics: “Compare marketing spend to revenue growth.”</li>
              <li>Follow up—context is carried automatically.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
