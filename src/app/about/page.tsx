import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-4xl font-bold text-white mb-8">About PromptAI</h1>

        <div className="space-y-10">
          <section>
            <h2 className="font-display text-xl font-semibold text-white mb-4">Our Mission</h2>
            <p className="text-[--text-secondary] mb-4 leading-relaxed">
              PromptAI was built with a simple mission: to help everyone communicate more effectively with AI.
              We believe that the quality of AI responses depends heavily on the quality of prompts, and we&apos;re
              here to bridge that gap.
            </p>
            <p className="text-[--text-secondary] leading-relaxed">
              Our AI-powered prompt enhancement tool transforms your rough ideas into clear, structured prompts
              that get better results from any AI assistant.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white mb-4">What We Do</h2>
            <div className="space-y-3">
              {[
                { title: "Prompt Enhancement", desc: "Our core technology analyzes your input and transforms it into a well-structured prompt with clear context, specific instructions, and defined output formats." },
                { title: "Chrome Extension", desc: "Use PromptAI directly in your browser. Select any text on any website and enhance it with one click." },
                { title: "Follow-up Refinement", desc: "Not quite right? Use our follow-up feature to refine and adjust your prompts until they're perfect." },
              ].map((item) => (
                <div key={item.title} className="glass-card rounded-xl p-5">
                  <h3 className="font-semibold text-white text-sm mb-1.5">{item.title}</h3>
                  <p className="text-sm text-[--text-secondary] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white mb-4">Why PromptAI?</h2>
            <ul className="space-y-3">
              {[
                "Get better results from ChatGPT, Claude, Gemini, and other AI tools",
                "Save time by getting it right the first time",
                "Learn prompt engineering best practices through examples",
                "Works everywhere with our Chrome extension",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-[--text-secondary]">
                  <svg className="w-4 h-4 text-teal-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-semibold text-white mb-4">Get Started</h2>
            <p className="text-[--text-secondary] mb-6 leading-relaxed">Ready to supercharge your prompts? Try PromptAI today.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/demo" className="px-6 py-3 text-sm text-white rounded-xl font-medium transition-all hover:brightness-110" style={{ background: "linear-gradient(135deg, #14b8a6, #0d9488)" }}>
                Try Demo
              </Link>
              <Link href="/pricing" className="px-6 py-3 text-sm border border-white/[0.08] text-[--text-secondary] hover:text-white rounded-xl font-medium hover:bg-white/[0.03] transition-all">
                View Pricing
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
