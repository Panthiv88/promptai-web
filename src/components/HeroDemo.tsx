"use client";

import { useEffect, useState, useRef } from "react";

const BEFORE_TEXT = "Help me write a cover letter for a marketing position at a tech company";

const AFTER_LINES = [
  { label: "Role", text: "Expert career coach with 15+ years in tech hiring" },
  { label: "Context", text: "Applying for Marketing Manager at a mid-to-large tech company" },
  { label: "Task", text: "Write a compelling cover letter highlighting achievements with metrics" },
  { label: "Format", text: "3-4 paragraphs, under 400 words, strong call-to-action closing" },
  { label: "Constraints", text: "No generic phrases. Focus on results and impact" },
];

type Phase = "typing" | "enhancing" | "result" | "pause";

export default function HeroDemo() {
  const [phase, setPhase] = useState<Phase>("typing");
  const [typed, setTyped] = useState("");
  const [visibleLines, setVisibleLines] = useState(0);
  const [dots, setDots] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Typing phase
  useEffect(() => {
    if (phase !== "typing") return;
    if (typed.length < BEFORE_TEXT.length) {
      timeoutRef.current = setTimeout(() => {
        setTyped(BEFORE_TEXT.slice(0, typed.length + 1));
      }, 30 + Math.random() * 30);
    } else {
      timeoutRef.current = setTimeout(() => setPhase("enhancing"), 800);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [phase, typed]);

  // Enhancing phase (loading dots)
  useEffect(() => {
    if (phase !== "enhancing") return;
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setDots((count % 3) + 1);
      if (count >= 9) {
        clearInterval(interval);
        setPhase("result");
      }
    }, 300);
    return () => clearInterval(interval);
  }, [phase]);

  // Result phase (lines appear one by one)
  useEffect(() => {
    if (phase !== "result") return;
    if (visibleLines < AFTER_LINES.length) {
      timeoutRef.current = setTimeout(() => {
        setVisibleLines((v) => v + 1);
      }, 250);
    } else {
      timeoutRef.current = setTimeout(() => setPhase("pause"), 2500);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [phase, visibleLines]);

  // Pause then restart
  useEffect(() => {
    if (phase !== "pause") return;
    timeoutRef.current = setTimeout(() => {
      setTyped("");
      setVisibleLines(0);
      setDots(0);
      setPhase("typing");
    }, 1500);
    return () => clearTimeout(timeoutRef.current);
  }, [phase]);

  return (
    <div className="w-full min-w-[340px] max-w-2xl lg:max-w-2xl xl:max-w-3xl">
      {/* Before card */}
      <div
        className="rounded-2xl overflow-hidden border border-white/[0.1]"
        style={{
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        {/* Window chrome */}
        <div className="px-5 py-3 border-b border-white/[0.08] flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
          <span className="ml-2 text-[11px] text-[--text-muted] font-semibold tracking-wide uppercase">Your Prompt</span>
        </div>

        <div className="p-5">
          <p className="text-[15px] text-[--text-primary]/80 leading-relaxed min-h-[2.5rem]">
            {typed}
            {phase === "typing" && <span className="inline-block w-0.5 h-5 bg-teal-400 ml-0.5 align-middle animate-pulse" />}
          </p>
        </div>
      </div>

      {/* Arrow + enhance indicator */}
      <div className="flex items-center justify-center my-4 gap-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        <div
          className={`px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-all duration-500 flex items-center gap-2 ${
            phase === "enhancing"
              ? "text-white scale-105"
              : phase === "result" || phase === "pause"
                ? "text-teal-400 bg-teal-500/15 border border-teal-500/25"
                : "text-[--text-muted] bg-white/[0.04] border border-white/[0.08]"
          }`}
          style={phase === "enhancing" ? { background: "linear-gradient(135deg, #14b8a6, #0d9488)", boxShadow: "0 0 25px rgba(20,184,166,0.4)" } : {}}
        >
          {phase === "enhancing" ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Enhancing{".".repeat(dots)}
            </>
          ) : phase === "result" || phase === "pause" ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Enhanced
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              PromptAI
            </>
          )}
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>

      {/* After card */}
      <div
        className={`rounded-2xl overflow-hidden transition-all duration-700 border ${
          phase === "result" || phase === "pause" ? "border-teal-500/30" : "border-white/[0.1]"
        }`}
        style={
          phase === "result" || phase === "pause"
            ? {
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 50px rgba(20,184,166,0.1), 0 0 0 1px rgba(20,184,166,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
              }
            : {
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
              }
        }
      >
        {/* Window chrome */}
        <div className="px-5 py-3 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
            <span className="ml-2 text-[11px] text-[--text-muted] font-semibold tracking-wide uppercase">Enhanced Prompt</span>
          </div>
          {(phase === "result" || phase === "pause") && visibleLines === AFTER_LINES.length && (
            <span className="text-[11px] text-teal-400/80 font-semibold">Ready to copy</span>
          )}
        </div>

        <div className="p-5 space-y-3 min-h-[180px]">
          {phase === "enhancing" && (
            <div className="flex items-center gap-2.5 py-10 justify-center">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0.15s" }} />
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          )}

          {(phase === "result" || phase === "pause") &&
            AFTER_LINES.map((line, i) => (
              <div
                key={line.label}
                className="transition-all duration-500"
                style={{
                  opacity: i < visibleLines ? 1 : 0,
                  transform: i < visibleLines ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <span className="text-teal-400 text-[13px] font-semibold">{line.label}: </span>
                <span className="text-[--text-primary]/70 text-[15px]">{line.text}</span>
              </div>
            ))}

          {phase === "typing" && (
            <div className="flex items-center justify-center py-10">
              <span className="text-sm text-[--text-muted]">Waiting for input...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
