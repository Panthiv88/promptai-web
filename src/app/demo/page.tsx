"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

function DemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialText = searchParams.get("text") || "";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      type: "system",
      content: "Welcome to PromptAI! Enter any text below and I'll transform it into a powerful, structured prompt.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState(initialText);
  const [isLoading, setIsLoading] = useState(false);
  const [licenseKey, setLicenseKey] = useState<string | null>(null);
  const [freeTrialUsed, setFreeTrialUsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const FREE_TRIAL_LIMIT = 1;
  const logged = isLoggedIn();

  useEffect(() => {
    if (!logged) {
      router.push("/signup");
    }
  }, [logged, router]);

  useEffect(() => {
    if (logged) {
      api.me().then((data) => {
        if (data.license_key) setLicenseKey(data.license_key as string);
      }).catch(() => {});
    }
  }, [logged]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (logged && initialText && messages.length === 1) {
      handleSubmit(new Event("submit") as unknown as React.FormEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logged]);

  if (!logged) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[--text-muted]">Redirecting to signup...</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      let result;
      if (licenseKey) {
        result = await api.enhance(userMessage.content, licenseKey);
      } else if (!freeTrialUsed) {
        result = await api.demoEnhance(userMessage.content);
        setFreeTrialUsed(true);
      } else {
        throw new Error("trial_used");
      }

      const enhancedPrompt = (result.result || result.enhanced_prompt || result.enhancedPrompt || result.prompt) as string;
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: enhancedPrompt || "No response received",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Something went wrong";
      let displayMessage = errorMessage;
      if (errorMessage === "trial_used") {
        displayMessage = "You've used your free trial! Upgrade to a paid plan for unlimited prompt enhancements.";
      }
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: "system",
        content: displayMessage,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  function startNewChat() {
    setMessages([
      {
        id: "welcome",
        type: "system",
        content: "Welcome to PromptAI! Enter any text below and I'll transform it into a powerful, structured prompt.",
        timestamp: new Date(),
      },
    ]);
    setInput("");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Header Bar */}
      <div className="border-b border-white/[0.06] bg-[--bg-surface] px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-display font-semibold text-white text-sm">PromptAI</h1>
            <p className="text-xs text-[--text-muted]">
              {licenseKey
                ? "Unlimited prompt enhancement"
                : freeTrialUsed
                ? "Free trial used — Upgrade for unlimited access"
                : `${FREE_TRIAL_LIMIT} free trial remaining`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={startNewChat}
              className="px-3 py-1.5 text-xs font-medium border border-white/[0.08] text-[--text-secondary] hover:text-white rounded-lg hover:bg-white/[0.03] transition-all"
            >
              New Chat
            </button>
            {!licenseKey && freeTrialUsed && (
              <Link
                href="/pricing"
                className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
              >
                Upgrade now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-5">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === "system"
                    ? "bg-teal-500/10 border border-teal-500/20 text-teal-300"
                    : message.type === "user"
                    ? "text-white"
                    : "glass-card text-[--text-primary]"
                }`}
                style={message.type === "user" ? { background: "linear-gradient(135deg, #14b8a6, #0d9488)" } : {}}
              >
                {message.type === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.06]">
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #14b8a6, #22d3ee)" }}
                    >
                      <span className="text-white text-[10px] font-bold">P</span>
                    </div>
                    <span className="text-xs font-medium text-[--text-secondary]">Enhanced Prompt</span>
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="ml-auto text-[--text-muted] hover:text-[--text-secondary] transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-card rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #14b8a6, #22d3ee)" }}
                  >
                    <span className="text-white text-[10px] font-bold">P</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Upgrade Banner */}
      {!licenseKey && freeTrialUsed && (
        <div className="px-4 py-3 border-t border-teal-500/15 bg-teal-500/5">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-sm text-teal-400">
              Loved it? Upgrade now for unlimited prompt enhancements!
            </p>
            <Link
              href="/pricing"
              className="px-4 py-1.5 text-xs font-medium text-white rounded-lg transition-all hover:brightness-110"
              style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
            >
              View plans
            </Link>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-white/[0.06] bg-[--bg-surface] px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !licenseKey && freeTrialUsed
                    ? "Upgrade to continue enhancing prompts..."
                    : "Enter text to enhance..."
                }
                disabled={isLoading || (!licenseKey && freeTrialUsed)}
                className="w-full p-3 pr-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-[--text-muted] resize-none focus:outline-none focus:border-teal-500/40 focus:ring-1 focus:ring-teal-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                rows={2}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || (!licenseKey && freeTrialUsed)}
                className="absolute right-2 bottom-2 p-2 text-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:brightness-110"
                style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-[--text-muted] text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-[--text-muted]">Loading demo...</div>}>
      <DemoContent />
    </Suspense>
  );
}
