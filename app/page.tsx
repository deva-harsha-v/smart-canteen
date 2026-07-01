"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Smartphone, Zap, ShieldCheck } from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Order in seconds",
    desc: "Browse live menus and place an order in under 10 seconds — no app download needed.",
  },
  {
    icon: Clock,
    title: "Real-time tracking",
    desc: "Watch your order move from pending to ready, updated live without refreshing.",
  },
  {
    icon: Smartphone,
    title: "Built for mobile",
    desc: "Designed for the phone in your pocket between classes, not a desktop dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Stall-side control",
    desc: "Vendors manage menus and order queues from a dedicated owner console.",
  },
];

const CATEGORIES = ["Pizza", "Burgers", "Sushi", "Drinks", "Snacks", "Desserts"];

export default function Home() {
  return (
    <main className="bg-background text-ink overflow-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[50%] bg-primary/20 blur-[140px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center pt-20 md:pt-0">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink/5 border border-ink/10 text-xs font-medium text-ink/60 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
              Live order tracking, no app required
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[0.95] tracking-tight">
              SKIP THE LINE.
              <br />
              <span className="text-primary">EAT SOONER.</span>
            </h1>

            <p className="text-ink/50 mt-6 max-w-md text-lg leading-relaxed">
              Order from your campus food stalls in a few taps, track it live,
              and pick it up the moment it&apos;s ready.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/student/stalls"
                className="group inline-flex items-center gap-2 bg-primary px-7 py-3.5 rounded-2xl font-semibold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              >
                Start ordering
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-ink/5 border border-ink/10 px-7 py-3.5 rounded-2xl font-semibold text-ink hover:bg-ink/10 transition-all"
              >
                Create an account
              </Link>
            </div>
          </div>

          <div className="flex justify-center animate-fade-up [animation-delay:120ms]">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-[80px] rounded-full" />
              <Image
                src="/food.png"
                alt="Food spread"
                width={460}
                height={460}
                priority
                className="relative rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl md:text-4xl font-black mb-2">
          Why people switch
        </h2>
        <p className="text-ink/40 mb-10">
          A faster ordering loop, built for busy canteens.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-surface/60 border border-ink/[0.06] p-6 rounded-2xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Icon size={20} />
              </div>
              <p className="font-semibold mb-1.5">{title}</p>
              <p className="text-sm text-ink/40 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <h2 className="text-3xl font-bold mb-8">
          What are you craving today?
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((item) => (
            <div
              key={item}
              className="bg-surface p-6 rounded-2xl border border-ink/10 hover:border-primary/40 hover:bg-surface/80 transition-all cursor-default text-center"
            >
              <p className="font-semibold">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/5 py-8 px-6 text-center text-sm text-ink/30">
        Built with Next.js &amp; Supabase — Smart Canteen
      </footer>
    </main>
  );
}