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

  // Redirect unauthenticated users to signup
  useEffect(() => {
    if (!logged) {
      router.push("/signup");
    }
  }, [logged, router]);

  // Fetch license key for logged-in users
  useEffect(() => {
    if (logged) {
      api.me().then((data) => {
        if (data.license_key) {
          setLicenseKey(data.license_key as string);
        }
      }).catch(() => {
        // Ignore errors - user might not have a license yet
      });
    }
  }, [logged]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Auto-submit if there's initial text and user is logged in
    if (logged && initialText && messages.length === 1) {
      handleSubmit(new Event("submit") as unknown as React.FormEvent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logged]);

  // Show loading while redirecting
  if (!logged) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to signup...</p>
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
        // Authenticated user with license - use the full API
        result = await api.enhance(userMessage.content, licenseKey);
      } else if (!freeTrialUsed) {
        // User without license gets 1 free try
        result = await api.demoEnhance(userMessage.content);
        setFreeTrialUsed(true);
      } else {
        // Free trial used up - show upgrade message
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
      <div className="border-b bg-white px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="font-semibold">PromptAI</h1>
            <p className="text-sm text-gray-500">
              {licenseKey
                ? "Unlimited prompt enhancement"
                : freeTrialUsed
                ? "Free trial used - Upgrade for unlimited access"
                : `${FREE_TRIAL_LIMIT} free trial remaining`}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={startNewChat}
              className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
            >
              New Chat
            </button>
            {!licenseKey && freeTrialUsed && (
              <Link
                href="/pricing"
                className="px-3 py-1.5 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                style={{ backgroundImage: "linear-gradient(180deg, #22D3EE, #14B8A6)" }}
              >
                Upgrade now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.type === "system"
                    ? "bg-teal-50 border border-teal-200 text-teal-800"
                    : "bg-gray-100 text-gray-900"
                }`}
                style={message.type === "user" ? { backgroundImage: "linear-gradient(135deg, #14B8A6, #22D3EE)", color: "white" } : {}}
              >
                {message.type === "assistant" && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundImage: "linear-gradient(135deg, #14B8A6, #22D3EE)" }}
                    >
                      <span className="text-white text-xs font-bold">P</span>
                    </div>
                    <span className="text-sm font-medium">Enhanced Prompt</span>
                    <button
                      onClick={() => copyToClipboard(message.content)}
                      className="ml-auto text-gray-400 hover:text-gray-600 transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ backgroundImage: "linear-gradient(135deg, #14B8A6, #22D3EE)" }}
                  >
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "0ms", backgroundColor: "#14B8A6" }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "150ms", backgroundColor: "#14B8A6" }} />
                    <div className="w-2 h-2 rounded-full animate-bounce" style={{ animationDelay: "300ms", backgroundColor: "#14B8A6" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Upgrade Banner - show after free trial is used */}
      {!licenseKey && freeTrialUsed && (
        <div className="px-4 py-3 border-t" style={{ background: "linear-gradient(90deg, rgba(20,184,166,0.1), rgba(34,211,238,0.1))", borderColor: "rgba(20,184,166,0.2)" }}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-sm" style={{ color: "#0f766e" }}>
              Loved it? Upgrade now for unlimited prompt enhancements!
            </p>
            <Link
              href="/pricing"
              className="px-4 py-2 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              style={{ backgroundImage: "linear-gradient(180deg, #22D3EE, #14B8A6)" }}
            >
              View plans
            </Link>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-white px-4 py-4">
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
                    : "Enter text to enhance (e.g., 'Help me write a cover letter for a marketing job')"
                }
                disabled={isLoading || (!licenseKey && freeTrialUsed)}
                className="w-full p-3 pr-12 border rounded-xl resize-none focus:ring-2 focus:ring-teal-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                rows={2}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || (!licenseKey && freeTrialUsed)}
                className="absolute right-2 bottom-2 p-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                style={{ backgroundImage: "linear-gradient(180deg, #22D3EE, #14B8A6)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading demo...</div>}>
      <DemoContent />
    </Suspense>
  );
}
