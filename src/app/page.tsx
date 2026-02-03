"use client";

import Link from "next/link";
import { useState } from "react";
import { ScrollAnimation, StaggeredAnimation } from "@/components/ScrollAnimation";

export default function HomePage() {
  const [demoInput, setDemoInput] = useState("");

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Instant Enhancement",
      description: "Transform any text into a structured, powerful prompt in seconds with our AI engine.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: "Iterative Refinement",
      description: "Use follow-ups to refine your prompts until they're perfect for your needs.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: "Privacy First",
      description: "Your prompts are never stored. We process and return results without keeping history.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Chrome Extension",
      description: "Enhance prompts anywhere on the web with our seamless Chrome extension.",
    },
  ];

  const testimonials = [
    {
      quote: "PromptAI has completely changed how I interact with ChatGPT. My prompts are now 10x more effective.",
      author: "Sarah K.",
      role: "Content Creator",
    },
    {
      quote: "As a developer, I use AI daily. PromptAI saves me hours by structuring my technical queries perfectly.",
      author: "Mike R.",
      role: "Software Engineer",
    },
    {
      quote: "The follow-up feature is incredible. I can iterate on prompts without starting from scratch.",
      author: "Emily T.",
      role: "Marketing Manager",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Enter Your Text",
      description: "Type or paste any text - a question, idea, or rough draft of what you want.",
    },
    {
      step: "2",
      title: "AI Enhancement",
      description: "Our AI transforms it into a structured prompt with role, context, and constraints.",
    },
    {
      step: "3",
      title: "Get Better Results",
      description: "Use the enhanced prompt in ChatGPT, Claude, or any LLM for superior responses.",
    },
  ];

  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(20,184,166,0.15), transparent), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(34,211,238,0.08), transparent)"
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up" duration={800}>
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight">
                Transform Your Ideas into{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: "linear-gradient(135deg, #14B8A6, #22D3EE)" }}
                >
                  Powerful Prompts
                </span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
                Stop struggling with AI prompts. PromptAI instantly converts your simple text into
                structured, effective prompts that get better results from ChatGPT, Claude, and other LLMs.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/demo"
                  className="px-8 py-4 text-white rounded-xl font-semibold hover:opacity-90 transition-all hover:scale-105 shadow-lg"
                  style={{
                    backgroundImage: "linear-gradient(180deg, #22D3EE, #14B8A6)",
                    boxShadow: "0 10px 30px rgba(20,184,166,0.3)"
                  }}
                >
                  Try Demo Free
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 border-2 border-gray-200 rounded-xl font-semibold hover:border-teal-300 hover:bg-teal-50 transition-all"
                >
                  View Pricing
                </Link>
              </div>
            </div>
          </ScrollAnimation>

          {/* Demo Preview */}
          <ScrollAnimation animation="fade-up" delay={200} duration={800}>
            <div className="mt-16 max-w-4xl mx-auto">
              <div
                className="bg-white rounded-2xl shadow-2xl border overflow-hidden"
                style={{ boxShadow: "0 25px 50px -12px rgba(20,184,166,0.15), 0 0 0 1px rgba(0,0,0,0.05)" }}
              >
                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-4 text-sm text-gray-500">PromptAI Demo</span>
                </div>
                <div className="p-6">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your simple text
                      </label>
                      <textarea
                        value={demoInput}
                        onChange={(e) => setDemoInput(e.target.value)}
                        placeholder="e.g., Help me write a cover letter for a marketing job"
                        className="w-full h-24 p-3 border rounded-lg resize-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-shadow"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Link
                      href={`/demo${demoInput ? `?text=${encodeURIComponent(demoInput)}` : ""}`}
                      className="px-6 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                      style={{ backgroundImage: "linear-gradient(180deg, #22D3EE, #14B8A6)" }}
                    >
                      Enhance with AI
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Why Choose PromptAI?
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Everything you need to get better results from AI
              </p>
            </div>
          </ScrollAnimation>

          <StaggeredAnimation
            animation="fade-up"
            staggerDelay={100}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 bg-white"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4"
                  style={{ backgroundImage: "linear-gradient(135deg, #14B8A6, #22D3EE)" }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                How It Works
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Three simple steps to better prompts
              </p>
            </div>
          </ScrollAnimation>

          <StaggeredAnimation
            animation="fade-up"
            staggerDelay={150}
            className="grid md:grid-cols-3 gap-8"
          >
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6 shadow-lg"
                  style={{
                    backgroundImage: "linear-gradient(180deg, #22D3EE, #14B8A6)",
                    boxShadow: "0 10px 30px rgba(20,184,166,0.3)"
                  }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollAnimation animation="fade-up">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Loved by Thousands
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                See what our users are saying
              </p>
            </div>
          </ScrollAnimation>

          <StaggeredAnimation
            animation="fade-up"
            staggerDelay={100}
            className="grid md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-xl border border-gray-100 bg-white hover:shadow-xl transition-all hover:-translate-y-1"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      style={{ color: "#14B8A6" }}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">&quot;{testimonial.quote}&quot;</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </StaggeredAnimation>
        </div>
      </section>

      {/* CTA Section */}
      <ScrollAnimation animation="fade-up">
        <section
          className="py-20"
          style={{ backgroundImage: "linear-gradient(135deg, #14B8A6, #22D3EE)" }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Prompts?
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Join thousands of users getting better AI results with PromptAI.
              Start with a free demo today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo"
                className="px-8 py-4 bg-white rounded-xl font-semibold hover:bg-teal-50 transition-colors"
                style={{ color: "#14B8A6" }}
              >
                Try Demo Free
              </Link>
              <Link
                href="/signup"
                className="px-8 py-4 border-2 border-white text-white rounded-xl font-semibold hover:bg-white/10 transition-colors"
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
