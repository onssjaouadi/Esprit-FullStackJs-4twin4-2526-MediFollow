"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Sparkles, Bot, User, Send, LineChart, AlertTriangle, Lightbulb } from "lucide-react";

interface VitalsAiAgentProps {
  vitals: any[];
  patientContext: any;
}

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function VitalsAiAgent({ vitals, patientContext }: VitalsAiAgentProps) {
  const [report, setReport] = useState<any>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatLoading]);

  const handleGenerateReport = async () => {
    if (vitals.length === 0) return;
    setGeneratingReport(true);
    setReportError(null);

    try {
      const res = await fetch("/api/coordinator/vitals-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vitalsList: vitals,
          patientContext
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReport(data.report);
      } else {
        setReportError(data.error || "Une erreur s'est produite lors de la génération.");
      }
    } catch (e) {
      setReportError("Erreur réseau. Veuillez réessayer.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    const newMessages = [...messages, { role: "user", content: userText } as Message];
    setMessages(newMessages);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/coordinator/vitals-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          vitalsList: vitals,
          patientContext
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, impossible de répondre pour le moment." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Erreur de connexion." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="mt-8 rounded-2xl border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-[#1a1a1a] shadow-sm overflow-hidden">
      {/* Header section */}
      <div className="bg-blue-50/50 dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800 p-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="size-5 text-blue-600" />
          Rapport & Intelligence Artificielle (Historique Complet)
        </h2>
        
        {!report && !generatingReport && (
            <button
              onClick={handleGenerateReport}
              disabled={vitals.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Lancer l'analyse du tableau complet
            </button>
        )}
      </div>

      <div className="p-6">
          {generatingReport && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
               <Loader2 className="size-10 animate-spin text-blue-600" />
               <p className="text-sm font-medium text-gray-500">Lecture des lignes et analyse des tendances en cours...</p>
            </div>
          )}

          {reportError && (
             <div className="bg-red-50 text-red-600 font-medium py-3 px-4 rounded-xl text-sm border border-red-100">
               {reportError}
             </div>
          )}

          {/* REPORT VIEW */}
          {report && !generatingReport && (
             <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* SECTION: Résumé */}
                    <div className="bg-blue-50/30 dark:bg-[#1f1f1f] rounded-2xl border border-blue-100 dark:border-gray-800 p-5">
                       <h3 className="font-bold text-blue-800 dark:text-blue-400 flex items-center gap-2">
                          <LineChart className="size-4" /> Résumé Global
                       </h3>
                       <p className="mt-2 text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                          {report.resumeGlobal}
                       </p>
                    </div>

                    {/* SECTION: Recommandations */}
                    <div className="bg-emerald-50/30 dark:bg-[#17241d] rounded-2xl border border-emerald-100 dark:border-emerald-900/40 p-5">
                       <h3 className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                          <Lightbulb className="size-4" /> Recommandations
                       </h3>
                       <ul className="mt-2 text-sm text-gray-800 dark:text-gray-200 space-y-2 list-disc ml-4">
                          {(report.recommandations || []).map((r: string, i: number) => (
                             <li key={i}>{r}</li>
                          ))}
                       </ul>
                    </div>
                </div>

                {/* SECTION: Anomalies */}
                <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                   <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                      <AlertTriangle className="size-4 text-amber-500" /> Analyse par paramètre (Bruit & Valeurs Sûres)
                   </h3>
                   <div className="space-y-3">
                      {(report.analyseParParametre || []).map((item: any, i: number) => (
                          <div key={i} className="flex flex-col sm:flex-row gap-2 sm:gap-6 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                             <div className="sm:w-1/4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                                {item.parametre}
                             </div>
                             <div className="sm:w-3/4 text-sm text-gray-600 dark:text-gray-400">
                                {item.analyse}
                             </div>
                          </div>
                      ))}
                   </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-800" />

                {/* Q&A CHAT */}
                <div className="pt-2">
                   <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                      Vous avez une question sur ce rapport ? 
                   </h3>
                   
                   {/* Messages list */}
                   <div className="max-h-[300px] overflow-y-auto space-y-4 mb-4 pr-2">
                      {messages.map((m, i) => (
                         <div key={i} className={`flex ${m.role === "assistant" ? "justify-start" : "justify-end"}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                               m.role === "assistant" 
                               ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-none" 
                               : "bg-blue-600 text-white rounded-br-none"
                            }`}>
                               {m.content}
                            </div>
                         </div>
                      ))}
                      {chatLoading && (
                         <div className="flex justify-start">
                            <div className="bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                               <Loader2 className="size-4 animate-spin" /> L'agent tape...
                            </div>
                         </div>
                      )}
                      <div ref={messagesEndRef} />
                   </div>

                   {/* Input Area */}
                   <form onSubmit={handleChat} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 p-1">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ex: Y a-t-il une corrélation entre la fièvre et la FC du 08/04 ?"
                        className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500"
                        disabled={chatLoading}
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className="flex items-center justify-center size-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        <Send className="size-4 ml-0.5" />
                      </button>
                   </form>
                </div>
             </div>
          )}
      </div>
    </div>
  );
}
