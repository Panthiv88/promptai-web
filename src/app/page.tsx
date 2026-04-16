"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { ScrollAnimation, StaggeredAnimation } from "@/components/ScrollAnimation";
import HeroDemo from "@/components/HeroDemo";

export default function HomePage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<"MONTHLY" | "QUARTERLY" | "ANNUAL">("MONTHLY");

  function handleSelectPlan(plan: "BASIC" | "PRO") {
    if (!isLoggedIn()) {
      router.push(`/signup?plan=${plan}&frequency=${frequency}`);
    } else {
      router.push(`/billing/checkout?plan=${plan}&frequency=${frequency}`);
    }
  }

  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Instant Enhancement",
      description: "Transform any text into a structured, powerful prompt in one click. No prompt engineering skills needed.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: "Smart Follow-ups",
      description: "Iteratively refine your prompts with context-aware follow-ups until they produce perfect results.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Chrome Extension",
      description: "Enhance prompts on any website with our seamless Chrome extension. Works with ChatGPT, Claude, and more.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Privacy First",
      description: "Your prompts are never stored or used for training. We process and return results without keeping data.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Smart Templates",
      description: "Automatically adds role definitions, context framing, output format, and constraints to your prompts.",
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Works Everywhere",
      description: "Compatible with ChatGPT, Claude, Gemini, Copilot, and any LLM that accepts text prompts.",
    },
  ];

  const howItWorks = [
    { step: "01", title: "Enter Your Text", description: "Type or paste any idea, question, or rough draft into the input." },
    { step: "02", title: "AI Enhancement", description: "Our AI structures it with role, context, format, and constraints." },
    { step: "03", title: "Get Better Results", description: "Use the enhanced prompt in any AI chatbot for dramatically better responses." },
  ];

  const testimonials = [
    { quote: "PromptAI has completely changed how I interact with ChatGPT. My prompts are now 10x more effective.", author: "Samira", role: "Content Creator" },
    { quote: "As a developer, I use AI daily. PromptAI saves me hours by structuring my technical queries perfectly.", author: "Aishni", role: "Software Engineer" },
    { quote: "The follow-up feature is incredible. I can iterate on prompts without starting from scratch each time.", author: "Panthiv", role: "Marketing Manager" },
  ];

  const plans = {
    BASIC: {
      name: "Basic",
      description: "For individual users",
      features: ["Unlimited prompt enhancements", "5 follow-ups per thread", "Priority support"],
      prices: {
        MONTHLY: { amount: 10, period: "mo" },
        QUARTERLY: { amount: 28, period: "qtr", savings: "Save 7%" },
        ANNUAL: { amount: 109, period: "yr", savings: "Save 9%" },
      },
    },
    PRO: {
      name: "Pro",
      description: "For power users",
      features: ["Unlimited prompt enhancements", "Unlimited follow-ups", "Priority support", "Early access to new features"],
      prices: {
        MONTHLY: { amount: 20, period: "mo" },
        QUARTERLY: { amount: 58, period: "qtr", savings: "Save 3%" },
        ANNUAL: { amount: 228, period: "yr", savings: "Save 5%" },
      },
    },
  };

  const faqs = [
    { question: "What is PromptAI?", answer: "PromptAI is an AI-powered tool that transforms your simple text into structured, powerful prompts. It automatically adds role definitions, context framing, output format, and constraints — so you get dramatically better results from any AI chatbot." },
    { question: "How does the enhancement work?", answer: "Our AI analyzes your input and restructures it using proven prompt engineering techniques. It adds a role definition (who the AI should be), relevant context, specific task instructions, output format requirements, and constraints — all tailored to your original request." },
    { question: "Is there a free trial?", answer: "Yes! Every new account gets a 5-day free trial with 1 prompt enhancement per day. No credit card required. You can also try a single demo enhancement without signing up." },
    { question: "What AI chatbots does it work with?", answer: "PromptAI-enhanced prompts work with any AI that accepts text input — ChatGPT, Claude, Gemini, Copilot, Perplexity, and more. The Chrome extension works on any website." },
    { question: "Can I cancel anytime?", answer: "Absolutely. You can cancel your subscription at any time from your dashboard. You'll keep access until the end of your current billing period. No questions asked." },
    { question: "Is my data safe?", answer: "Yes. We don't store your prompts or use them for training. Your text is processed in real-time and returned immediately. We only store account information needed for authentication and billing." },
  ];

  return (
    <div className="overflow-hidden noise-overlay">
      {/* ═══════════════════ HERO ═══════════════════ */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center">
        {/* Background lighting — layered orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary large orbs */}
          <div className="orb-glow orb-glow-teal orb-glow-xl w-[1000px] h-[1000px] -top-[30%] left-[10%] opacity-60" />
          <div className="orb-glow orb-glow-cyan orb-glow-xl w-[800px] h-[800px] top-[5%] right-[5%] opacity-50" />
          <div className="orb-glow orb-glow-purple orb-glow-xl w-[700px] h-[700px] bottom-[-20%] left-[30%] opacity-45" />
          {/* Secondary accent orbs */}
          <div className="orb-glow orb-glow-teal orb-glow-lg w-[400px] h-[400px] top-[60%] -left-[5%] opacity-40" style={{ animationDelay: "-8s" }} />
          <div className="orb-glow orb-glow-cyan orb-glow-md w-[350px] h-[350px] top-[15%] left-[45%] opacity-35" style={{ animationDelay: "-12s" }} />
          <div className="orb-glow orb-glow-pink orb-glow-lg w-[500px] h-[500px] -bottom-[10%] right-[10%] opacity-30" style={{ animationDelay: "-5s" }} />
          {/* Corner glows */}
          <div className="orb-glow orb-glow-teal orb-glow-xl w-[600px] h-[600px] -top-[15%] -left-[10%] opacity-55" style={{ animationDelay: "-3s" }} />
          <div className="orb-glow orb-glow-cyan orb-glow-xl w-[600px] h-[600px] -bottom-[15%] -right-[10%] opacity-50" style={{ animationDelay: "-7s" }} />
          {/* Grid overlay */}
          <div className="absolute inset-0 grid-animated" />
        </div>

        <div className="relative w-full py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-0 w-full pl-6 pr-6 sm:pl-10 sm:pr-10 lg:pl-20 lg:pr-16 xl:pl-28 xl:pr-20 2xl:pl-36 2xl:pr-28">
            {/* Left half — text, pushed to the left edge */}
            <ScrollAnimation animation="fade-up" duration={800}>
              <div className="flex flex-col justify-center">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  <span className="font-medium text-[--text-secondary]" style={{ fontSize: "clamp(0.7rem, 0.6rem + 0.25vw, 0.8rem)" }}>AI-Powered Prompt Engineering</span>
                </div>

                <h1
                  className="tracking-tight leading-[1.1]"
                  style={{ fontSize: "clamp(2.5rem, 1.2rem + 4vw, 5.2rem)", fontFamily: "var(--font-dm-serif)" }}
                >
                  Write prompts that
                  <br />
                  <span className="gradient-text">actually work</span>
                </h1>

                <p
                  className="mt-5 text-[--text-secondary] leading-relaxed max-w-md"
                  style={{ fontSize: "clamp(0.9rem, 0.75rem + 0.4vw, 1.1rem)" }}
                >
                  One click transforms your simple ideas into structured,
                  powerful prompts that get dramatically better AI results.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/demo"
                    className="group px-6 py-3 text-sm text-white font-semibold rounded-xl transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.98] text-center"
                    style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)", boxShadow: "0 0 30px rgba(20,184,166,0.25)" }}
                  >
                    Try it free
                    <svg className="inline-block ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                  <Link href="#pricing" className="px-6 py-3 text-sm border border-white/[0.1] text-[--text-secondary] hover:text-white hover:border-white/[0.2] hover:bg-white/[0.03] rounded-xl font-semibold transition-all text-center">
                    See pricing
                  </Link>
                </div>

                {/* Download links */}
                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href="https://chromewebstore.google.com/detail/promptai-–-prompt-enhance/ibaoelckmaefmkiafoaaalbcjblnfjjd"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[--text-muted] hover:text-[--text-secondary] transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C8.21 0 4.831 1.757 2.632 4.501l3.953 6.848A5.454 5.454 0 0 1 12 6.545h10.691A12 12 0 0 0 12 0zM1.931 5.47A11.943 11.943 0 0 0 0 12c0 6.012 4.42 10.991 10.189 11.864l3.953-6.847a5.45 5.45 0 0 1-6.865-2.29zm13.342 2.166a5.446 5.446 0 0 1 1.45 7.09l.002.001h-.002l-3.952 6.848a12.014 12.014 0 0 0 9.229-9.006zM12 16.364a4.364 4.364 0 1 1 0-8.728 4.364 4.364 0 0 1 0 8.728z" />
                    </svg>
                    <span className="font-medium">Also available as a Chrome Extension</span>
                  </a>
                  <a
                    href="https://kfnxajbwih7ptk3x.public.blob.vercel-storage.com/releases/PromptAI/0.1.4/PromptAI-0.1.4-universal.dmg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[--text-muted] hover:text-[--text-secondary] transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span className="font-medium">Download the Mac App</span>
                  </a>
                </div>
              </div>
            </ScrollAnimation>

            {/* Right half — demo centered within this half */}
            <ScrollAnimation animation="fade-left" delay={300} duration={800}>
              <div className="relative flex items-center justify-center h-full">
                {/* Fade out grid behind demo */}
                <div
                  className="absolute inset-0 -m-16 z-0 pointer-events-none"
                  style={{ background: "radial-gradient(circle at 50% 50%, rgba(10, 14, 26, 0.7) 20%, transparent 65%)" }}
                />
                <div className="relative z-10">
                  <HeroDemo />
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ═══════════════════ SOCIAL PROOF ═══════════════════ */}
      <section className="py-14 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="orb-glow orb-glow-teal orb-glow-xl w-[500px] h-[500px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-35 ambient-breathe" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="grid grid-cols-3 max-w-3xl mx-auto gap-8 text-center">
              {[
                { value: "5,000+", label: "Prompts Enhanced" },
                { value: "4.9/5", label: "User Rating" },
                { value: "100%", label: "Privacy Compliant" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl sm:text-3xl font-display font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-sm text-[--text-muted]">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* ═══════════════════ HOW IT WORKS ═══════════════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="orb-glow orb-glow-cyan orb-glow-lg w-[600px] h-[600px] -top-[15%] -left-[12%] opacity-40 ambient-breathe" />
          <div className="orb-glow orb-glow-purple orb-glow-lg w-[500px] h-[500px] bottom-[0%] -right-[12%] opacity-35" style={{ animationDelay: "-3s" }} />
          <div className="absolute inset-0 grid-animated opacity-60" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">Simple Process</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">How it works</h2>
              <p className="mt-4 text-[--text-secondary] max-w-xl mx-auto">Three steps to dramatically better AI responses</p>
            </div>
          </ScrollAnimation>

          <StaggeredAnimation animation="fade-up" staggerDelay={150} className="grid md:grid-cols-3 gap-6">
            {howItWorks.map((item) => (
              <div key={item.step} className="glass-card rounded-2xl p-7 text-center group">
                <div className="w-14 h-14 mx-auto mb-5 rounded-xl flex items-center justify-center font-display text-lg font-bold text-teal-400 border border-teal-500/20 bg-teal-500/5 group-hover:bg-teal-500/10 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* ═══════════════════ FEATURES ═══════════════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="orb-glow orb-glow-teal orb-glow-xl w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40 ambient-breathe" />
          <div className="orb-glow orb-glow-purple orb-glow-lg w-[400px] h-[400px] top-[5%] -right-[8%] opacity-35" style={{ animationDelay: "-6s" }} />
          <div className="orb-glow orb-glow-cyan orb-glow-md w-[350px] h-[350px] bottom-[5%] -left-[8%] opacity-30" style={{ animationDelay: "-10s" }} />
          <div className="absolute inset-0 dot-grid opacity-40" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">Features</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">Everything you need</h2>
              <p className="mt-4 text-[--text-secondary] max-w-xl mx-auto">Powerful tools to get the best out of every AI interaction</p>
            </div>
          </ScrollAnimation>

          <StaggeredAnimation animation="fade-up" staggerDelay={80} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 group hover:border-teal-500/20">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-teal-400 bg-teal-500/10 mb-4 group-hover:bg-teal-500/15 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-[--text-secondary] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* ═══════════════════ BEFORE / AFTER ═══════════════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="orb-glow orb-glow-teal orb-glow-lg w-[600px] h-[600px] top-[10%] left-[55%] opacity-35 ambient-breathe" style={{ animationDelay: "-4s" }} />
          <div className="orb-glow orb-glow-pink orb-glow-md w-[400px] h-[400px] bottom-[5%] left-[5%] opacity-25" style={{ animationDelay: "-7s" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">See The Difference</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">Before &amp; After</h2>
              <p className="mt-4 text-[--text-secondary] max-w-xl mx-auto">Watch how a simple idea transforms into a professional prompt</p>
            </div>
          </ScrollAnimation>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <ScrollAnimation animation="fade-right" delay={100}>
              <div className="glass-card rounded-2xl p-6 h-full">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-white/[0.06] text-xs font-medium text-[--text-muted]">BEFORE</span>
                </div>
                <p className="text-[--text-secondary] leading-relaxed text-sm">
                  &quot;Help me write a cover letter for a marketing position at a tech company&quot;
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation animation="fade-left" delay={200}>
              <div className="glass-card rounded-2xl p-6 h-full border-teal-500/20 hover:border-teal-500/30" style={{ boxShadow: "0 0 40px rgba(20,184,166,0.06)" }}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-md bg-teal-500/10 text-xs font-medium text-teal-400">AFTER</span>
                </div>
                <div className="text-sm text-[--text-secondary] leading-relaxed space-y-3">
                  <p><span className="text-teal-400/70 font-medium">Role:</span> Expert career coach with 15+ years in tech industry hiring</p>
                  <p><span className="text-teal-400/70 font-medium">Context:</span> Applying for Marketing Manager at a mid-to-large tech company with 5 years of experience</p>
                  <p><span className="text-teal-400/70 font-medium">Task:</span> Write a compelling cover letter highlighting achievements with metrics, tech marketing understanding, professional yet personable tone</p>
                  <p><span className="text-teal-400/70 font-medium">Format:</span> 3-4 paragraphs, under 400 words, strong call-to-action closing</p>
                  <p><span className="text-teal-400/70 font-medium">Constraints:</span> No generic phrases. Focus on results and impact over responsibilities</p>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PRICING ═══════════════════ */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="orb-glow orb-glow-teal orb-glow-xl w-[700px] h-[700px] -bottom-[25%] left-1/2 -translate-x-1/2 opacity-45 ambient-breathe" style={{ animationDelay: "-2s" }} />
          <div className="orb-glow orb-glow-cyan orb-glow-lg w-[400px] h-[400px] top-[5%] -right-[10%] opacity-35" style={{ animationDelay: "-5s" }} />
          <div className="orb-glow orb-glow-purple orb-glow-md w-[300px] h-[300px] top-[30%] -left-[5%] opacity-25" style={{ animationDelay: "-9s" }} />
          <div className="absolute inset-0 grid-animated opacity-40" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">Pricing</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">Simple, transparent pricing</h2>
              <p className="mt-4 text-[--text-secondary]">Start with a 5-day free trial. No credit card required.</p>
            </div>
          </ScrollAnimation>

          {/* Frequency toggle */}
          <ScrollAnimation animation="fade-up" delay={100}>
            <div className="flex justify-center mb-10">
              <div className="inline-flex rounded-xl border border-white/[0.06] p-1 bg-white/[0.02]">
                {(["MONTHLY", "QUARTERLY", "ANNUAL"] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setFrequency(freq)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      frequency === freq
                        ? "bg-white/[0.08] text-white shadow-sm"
                        : "text-[--text-muted] hover:text-[--text-secondary]"
                    }`}
                  >
                    {freq.charAt(0) + freq.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </ScrollAnimation>

          {/* Plan cards */}
          <StaggeredAnimation animation="fade-up" staggerDelay={150} className="grid md:grid-cols-2 gap-5">
            {(["BASIC", "PRO"] as const).map((planKey) => {
              const plan = plans[planKey];
              const price = plan.prices[frequency];
              const isPro = planKey === "PRO";

              return (
                <div
                  key={planKey}
                  className={`glass-card rounded-2xl p-7 relative ${isPro ? "border-teal-500/30" : ""}`}
                  style={isPro ? { boxShadow: "0 0 50px rgba(20,184,166,0.08)" } : {}}
                >
                  {isPro && (
                    <span className="absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-display font-bold text-white">{plan.name}</h3>
                  <p className="text-sm text-[--text-muted] mt-1">{plan.description}</p>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-4xl font-display font-bold text-white">${price.amount}</span>
                    <span className="text-[--text-muted] text-sm">/{price.period}</span>
                    {"savings" in price && price.savings && <span className="ml-2 text-xs font-medium text-teal-400">{price.savings}</span>}
                  </div>

                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-[--text-secondary]">
                        <svg className="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(planKey)}
                    className={`w-full mt-7 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-110 ${
                      isPro
                        ? "text-white"
                        : "text-white bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08]"
                    }`}
                    style={isPro ? { background: "linear-gradient(135deg, #14b8a6, #0d9488)" } : {}}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </StaggeredAnimation>

          <ScrollAnimation animation="fade-up" delay={300}>
            <p className="text-center text-xs text-[--text-muted] mt-8">
              All plans include a 5-day free trial. Cancel anytime. No questions asked.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* ═══════════════════ TESTIMONIALS ═══════════════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="orb-glow orb-glow-purple orb-glow-lg w-[550px] h-[550px] top-[10%] left-[15%] opacity-35 ambient-breathe" style={{ animationDelay: "-3s" }} />
          <div className="orb-glow orb-glow-teal orb-glow-lg w-[450px] h-[450px] bottom-[5%] right-[10%] opacity-25" style={{ animationDelay: "-8s" }} />
          <div className="absolute inset-0 dot-grid opacity-35" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">Testimonials</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">Loved by thousands</h2>
            </div>
          </ScrollAnimation>

          <StaggeredAnimation animation="fade-up" staggerDelay={100} className="grid md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[--text-secondary] leading-relaxed mb-5">&quot;{t.quote}&quot;</p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.author}</p>
                  <p className="text-xs text-[--text-muted]">{t.role}</p>
                </div>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="orb-glow orb-glow-cyan orb-glow-lg w-[450px] h-[450px] top-[10%] -right-[8%] opacity-35 ambient-breathe" style={{ animationDelay: "-5s" }} />
          <div className="orb-glow orb-glow-teal orb-glow-md w-[400px] h-[400px] bottom-[10%] -left-[8%] opacity-25" style={{ animationDelay: "-9s" }} />
          <div className="absolute inset-0 grid-animated opacity-30" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-14">
              <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">FAQ</p>
              <h2 className="font-display text-3xl sm:text-4xl font-bold">Frequently asked questions</h2>
            </div>
          </ScrollAnimation>

          <StaggeredAnimation animation="fade-up" staggerDelay={60} className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-medium text-white">{faq.question}</span>
                  <svg
                    className={`w-4 h-4 text-[--text-muted] flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: openFaq === i ? "200px" : "0", opacity: openFaq === i ? 1 : 0 }}
                >
                  <p className="px-6 pb-5 text-sm text-[--text-secondary] leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* ═══════════════════ FINAL CTA ═══════════════════ */}
      <ScrollAnimation animation="fade-up">
        <section className="py-24 relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="orb-glow orb-glow-teal orb-glow-xl w-[700px] h-[700px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50 ambient-breathe" />
            <div className="orb-glow orb-glow-cyan orb-glow-lg w-[450px] h-[450px] top-[20%] left-[15%] opacity-40" style={{ animationDelay: "-4s" }} />
            <div className="orb-glow orb-glow-purple orb-glow-lg w-[400px] h-[400px] bottom-[15%] right-[15%] opacity-35" style={{ animationDelay: "-7s" }} />
            <div className="absolute inset-0 grid-animated opacity-50" />
          </div>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-5">
              Ready to transform your prompts?
            </h2>
            <p className="text-lg text-[--text-secondary] mb-10 max-w-xl mx-auto">
              Join thousands of users getting better AI results. Start with a free demo today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/demo"
                className="px-8 py-3.5 text-white font-semibold rounded-xl transition-all hover:brightness-110 hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)", boxShadow: "0 0 30px rgba(20,184,166,0.2)" }}
              >
                Try Demo Free
              </Link>
              <Link
                href="/signup"
                className="px-8 py-3.5 border border-white/[0.1] text-[--text-secondary] hover:text-white hover:border-white/[0.2] rounded-xl font-semibold transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </section>
      </ScrollAnimation>
    </div>
  );
}
