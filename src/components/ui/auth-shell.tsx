"use client";

import Image from "next/image";
import React from "react";

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface AuthShellProps {
  title: React.ReactNode;
  description: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  children: React.ReactNode;
}

export function GlassInputWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-colors focus-within:border-[var(--brand-teal)]/50 focus-within:bg-[var(--brand-teal)]/5">
      {children}
    </div>
  );
}

function TestimonialCard({ testimonial, delay }: { testimonial: Testimonial; delay: string }) {
  return (
    <div
      className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-white/[0.04] backdrop-blur-xl border border-white/10 p-5 w-64 shadow-xl shadow-black/30`}
    >
      <Image
        src={testimonial.avatarSrc}
        width={40}
        height={40}
        className="h-10 w-10 object-cover rounded-2xl"
        alt={`${testimonial.name} avatar`}
      />
      <div className="text-sm leading-snug">
        <p className="font-medium text-[var(--text-primary)]">{testimonial.name}</p>
        <p className="text-[var(--text-secondary)]">{testimonial.handle}</p>
        <p className="mt-1 text-[var(--text-primary)]/80">{testimonial.text}</p>
      </div>
    </div>
  );
}

export function AuthShell({
  title,
  description,
  heroImageSrc,
  testimonials = [],
  children,
}: AuthShellProps) {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col md:flex-row">
      <section className="flex-1 flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <h1 className="animate-element animate-delay-100 font-display text-4xl md:text-5xl font-semibold leading-tight tracking-tight text-[var(--text-primary)]">
              {title}
            </h1>
            <p className="animate-element animate-delay-200 text-[var(--text-secondary)]">
              {description}
            </p>
            {children}
          </div>
        </div>
      </section>

      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center shadow-2xl shadow-black/40"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
            aria-hidden
          />
          <div
            className="absolute inset-4 rounded-3xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, rgba(20,184,166,0.15) 0%, rgba(34,211,238,0.05) 40%, rgba(0,0,0,0.4) 100%)",
            }}
            aria-hidden
          />
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && (
                <div className="hidden xl:flex">
                  <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />
                </div>
              )}
              {testimonials[2] && (
                <div className="hidden 2xl:flex">
                  <TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" />
                </div>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
