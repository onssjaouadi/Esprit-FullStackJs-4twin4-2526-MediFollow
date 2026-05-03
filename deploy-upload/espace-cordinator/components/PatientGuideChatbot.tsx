"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Send, Bot, User, ShieldAlert } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function PatientGuideChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour ! Je suis l'assistant MediFollow. Avez-vous une question sur la prise de vos constantes aujourd'hui ?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le bas lorsque de nouveaux messages arrivent
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const newContext = [...messages, { role: "user", content: userText } as Message];
    setMessages(newContext);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/patient/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newContext }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Oups, je rencontre un petit problème de connexion. Veuillez réessayer dans quelques instants.",
          },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur est survenue lors de l'envoi de votre message.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
      {/* HEADER */}
      <div className="flex items-center gap-3 bg-red-600 px-5 py-4 text-white">
        <Bot className="size-6" />
        <div>
          <h3 className="font-bold text-lg leading-tight">Assistant Guide MediFollow</h3>
          <p className="text-xs text-red-100 flex items-center gap-1 mt-0.5">
            <ShieldAlert className="size-3" /> Les réponses ne remplacent pas un avis médical.
          </p>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/40">
        {messages.map((m, i) => {
          const isAssistant = m.role === "assistant";
          return (
            <div key={i} className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}>
              <div 
                className={`flex max-w-[85%] gap-3 ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
              >
                <div 
                  className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center ${
                    isAssistant 
                      ? "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400" 
                      : "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400"
                  }`}
                >
                  {isAssistant ? <Bot className="size-4" /> : <User className="size-4" />}
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${
                    isAssistant 
                      ? "bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none" 
                      : "bg-blue-600 text-white rounded-tr-none"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="flex max-w-[85%] gap-3">
              <div className="flex-shrink-0 size-8 rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 flex items-center justify-center">
                <Bot className="size-4" />
              </div>
              <div className="px-5 py-3 rounded-2xl bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-tl-none text-gray-500">
                <Loader2 className="size-4 animate-spin" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 p-4">
        <form 
          onSubmit={handleSend} 
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-800 p-1"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question ici..."
            className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex items-center justify-center size-10 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 transition-colors"
          >
            <Send className="size-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
