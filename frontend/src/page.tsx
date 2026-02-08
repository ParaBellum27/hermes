"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ClipboardList,
  Download,
  Info,
  Link as LinkIcon,
  MessageCircle,
  Mic,
  Pencil,
  Play,
  Sparkles,
  TrendingUp,
  User,
  Users,
} from "lucide-react";

const navLinks = [
  { label: "Create", icon: Pencil, href: "/dashboard/create" },
  { label: "Creators", icon: Users, href: "/dashboard/creators" },
  { label: "Content", icon: Download, href: "/dashboard/content" },
  { label: "Profile", icon: User, href: "/dashboard/personal-info" },
];

const walkthrough = [
  {
    title: "Drop URLs",
    description: "Add the LinkedIn creators you trust so Muse can pull their posts.",
    icon: LinkIcon,
    href: "#workspace",
  },
  {
    title: "Analyze winners",
    description: "See the hooks, cadence, and post types that are working right now.",
    icon: Activity,
    href: "#workspace",
  },
  {
    title: "Draft with AI",
    description: "Voice or keyboard: turn inspo into ready-to-publish drafts in minutes.",
    icon: Bot,
    href: "#workspace",
  },
  {
    title: "Publish with proof",
    description: "Track saves and comments so you know what to repeat next time.",
    icon: BarChart3,
    href: "#cta",
  },
];

const feedItems = [
  {
    author: "Koko Kimball",
    delta: "16.1x avg",
    time: "1 day ago",
    text: "Celsius didn’t change the drink. They changed the story.",
    stats: { likes: 129, comments: 5, reposts: 8 },
    tag: "Banger",
  },
  {
    author: "Koko Kimball",
    delta: "2.3x avg",
    time: "1 week ago",
    text: "One of my favorite things about being part of the KNS team is how often we come together to learn, to laugh, to play games, and break bread.",
    stats: { likes: 18, comments: 3, reposts: 1 },
    tag: "Mid",
  },
];

const quickStats = [
  { label: "Creators tracked", value: "47" },
  { label: "Posts analyzed", value: "519" },
  { label: "Reach lift (early customers)", value: "Up to 10x", note: "Directional lift from early customers using inspo + AI edits." },
];

const featureCards = [
  {
    title: "Content Library",
    description: "Every post your creators publish, organized with tags, saves, and metrics.",
    icon: ClipboardList,
    pill: "519 posts",
  },
  {
    title: "Create with AI",
    description: "Use winning posts as inspo, rewrite with AI, and ship without leaving your flow.",
    icon: Pencil,
    pill: "Voice mode",
  },
  {
    title: "Profile Intelligence",
    description: "Measure how magnetic your profile reads and close the gaps before you post.",
    icon: User,
    pill: "65% ready",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "$50",
    cadence: "/mo",
    blurb: "Solo operators tracking what wins and drafting faster.",
    badge: "Best for solos",
    highlight: false,
    features: ["Post discovery", "Voice adaptation", "Basic analytics", "30-day money-back"],
  },
  {
    name: "Standard",
    price: "$100",
    cadence: "/mo",
    blurb: "Teams who want AI in the loop and room to collaborate.",
    badge: "Most popular",
    highlight: true,
    features: ["Everything in Starter", "AI personalization", "Multi-profile support", "Team collaboration", "30-day money-back"],
  },
  {
    name: "Pro",
    price: "$250",
    cadence: "/mo",
    blurb: "Growing teams that need oversight, velocity, and support.",
    badge: "For scale",
    highlight: false,
    features: ["Everything in Standard", "Team analytics", "Priority support", "API access", "30-day money-back"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900">
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-80" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(85,120,200,0.09),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(128,194,255,0.14),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(85,120,200,0.08),transparent_25%)]" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-10">
          {/* Nav */}
          <header className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-5 py-3 shadow-[0_15px_40px_rgba(15,23,42,0.06)] backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Muse"
                width={40}
                height={40}
                className="h-9 w-9 rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
              />
              <div className="text-lg font-semibold tracking-tight text-slate-900">Muse</div>
            </div>
            <div className="hidden items-center gap-1 rounded-xl bg-slate-100/80 p-1 shadow-inner shadow-slate-200 sm:flex">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800"
                  >
                    <Icon className="h-4 w-4 text-slate-400" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-slate-300 transition hover:-translate-y-[1px] hover:shadow-lg"
              >
                Launch Muse
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          {/* Hero */}
          <section className="mt-12 grid items-start gap-10 lg:grid-cols-[1.05fr,1fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Looks and feels like the product
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  Turn top LinkedIn posts into ready-to-publish drafts for your brand in minutes
                </h1>
                <p className="max-w-2xl text-lg text-slate-600">
                  Paste the creators you trust, see what&apos;s winning this week, and ship consistent, on-brand posts
                  without starting from scratch.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-[1.5fr,1fr]">
                <div className="grid gap-3 sm:grid-cols-3">
                  {quickStats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
                    >
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                        {stat.label}
                        {stat.note && (
                          <span className="group relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                            <Info className="h-3.5 w-3.5" />
                            <span className="pointer-events-none absolute -left-2 top-6 hidden w-52 rounded-lg bg-slate-900 px-3 py-2 text-left text-[11px] font-normal text-white shadow-lg group-hover:block">
                              {stat.note}
                            </span>
                          </span>
                        )}
                      </div>
                      <div className="text-xl font-semibold text-slate-900">{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Customer proof</div>
                  <p className="mt-1 text-slate-800">
                    “Muse turned my swipe file into 3 ready posts in under 20 minutes—and one booked two demos.”
                  </p>
                  <div className="mt-2 text-xs font-semibold text-slate-500">CMO, B2B SaaS</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard/create"
                  className="group inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 transition hover:-translate-y-[1px] hover:bg-sky-700"
                >
                  Start with your creators
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
                <Link
                  href="#walkthrough"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 underline underline-offset-4 transition hover:text-slate-900"
                >
                  Watch the walkthrough
                  <Play className="h-4 w-4 text-slate-500" />
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                  <Sparkles className="h-4 w-4 text-sky-600" />
                  Voice mode, CTA proof, tone checks
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                  <Pencil className="h-4 w-4 text-slate-500" />
                  Content feed + AI assistant
                </div>
              </div>
            </motion.div>

            <motion.div
              id="workspace"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.05 }}
              className="relative"
            >
              <div className="absolute -left-6 -top-10 h-32 w-32 rounded-full bg-sky-200/40 blur-3xl" />
              <div className="absolute -right-4 -bottom-10 h-32 w-32 rounded-full bg-emerald-200/50 blur-3xl" />
              <div className="relative overflow-hidden rounded-[22px] border border-slate-200 bg-white/95 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-sky-600" />
                    <span className="text-sm font-semibold text-slate-700">Muse workspace</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    Product preview
                  </div>
                </div>
                <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  What your day-to-day looks like
                </div>
                <div className="grid gap-4 bg-slate-50/60 p-5 lg:grid-cols-[0.9fr,1.2fr,0.8fr]">
                  {/* Feed */}
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100/60">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <span>Step 1 · Content feed</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">
                        Inspiration
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                      <span>Content Feed</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                        All (244)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <button className="rounded-lg bg-slate-900 px-3 py-1 text-white shadow-sm">All</button>
                      <button className="rounded-lg bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200">
                        Bangers (45)
                      </button>
                      <button className="rounded-lg bg-white px-3 py-1 text-slate-600 ring-1 ring-slate-200">
                        Mid (118)
                      </button>
                    </div>
                    <div className="space-y-3">
                      {feedItems.map((item) => (
                        <div key={item.text} className="rounded-xl border border-amber-100 bg-amber-50/60 p-3 shadow-inner">
                          <div className="flex items-center justify-between text-xs text-slate-600">
                            <div className="font-semibold text-slate-800">{item.author}</div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-amber-600 ring-1 ring-amber-200">
                                {item.delta}
                              </span>
                              <span>{item.time}</span>
                            </div>
                          </div>
                          <p className="mt-1 max-h-16 overflow-hidden text-ellipsis text-sm text-slate-700">
                            {item.text}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <span className="text-amber-500">♡</span>
                                {item.stats.likes}
                              </span>
                              <span className="flex items-center gap-1">💬 {item.stats.comments}</span>
                              <span className="flex items-center gap-1">↻ {item.stats.reposts}</span>
                            </div>
                            <button className="rounded-lg bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                              Use as inspo
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Writer */}
                  <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100/60">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <span>Step 2 · Draft</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">
                        AI assist
                      </span>
                    </div>
                    <div className="mb-3 mt-1 flex items-center justify-between text-sm font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <Pencil className="h-4 w-4 text-sky-600" />
                        Your Content
                      </div>
                      <span className="text-xs text-slate-500">0 words · 0 chars</span>
                    </div>
                    <div className="flex-1 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm text-slate-500">
                      Select a post from the feed to get started, or start writing here…
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm">
                        Edit Content
                      </button>
                      <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
                        Generate outline
                      </button>
                    </div>
                  </div>

                  {/* Assistant */}
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ring-1 ring-slate-100/60">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      <span>Step 3 · Polish</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 ring-1 ring-slate-200">
                        Edits
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-sky-600" />
                        <div className="text-sm font-semibold text-slate-800">AI Assistant</div>
                      </div>
                      <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                        Ready to help
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                      <span className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-slate-500" />
                        Voice Mode
                      </span>
                      <span className="flex h-5 w-9 items-center rounded-full bg-slate-300/60">
                        <span className="ml-1 h-4 w-4 rounded-full bg-white shadow" />
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-500">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">What would you like to change?</p>
                      <p className="mt-1 text-slate-600">e.g., make it shorter, more professional, add emojis…</p>
                    </div>
                    <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
                      <MessageCircle className="h-4 w-4" />
                      Edit Content
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Walkthrough */}
          <section id="walkthrough" className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Walkthrough: how Muse works</h2>
                <p className="mt-1 text-slate-600">Drop URLs → Analyze winners → Draft with AI → Publish with proof.</p>
              </div>
              <span className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 sm:inline-flex">
                Looks like the real app
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {walkthrough.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <Link key={step.title} href={step.href} className="group">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: idx * 0.05 }}
                      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm shadow-slate-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="mt-3 text-sm font-semibold text-slate-500">Step {idx + 1}</div>
                      <div className="text-lg font-semibold text-slate-900">{step.title}</div>
                      <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                      <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-sky-600">
                        Jump to view <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Product sections */}
          <section className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Product views you&apos;ll live in</h2>
                <p className="mt-1 text-slate-600">Library, creation, and profile intelligence—same colors, same feel.</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {featureCards.map((feature) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.65, ease: "easeOut" }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-sky-600" />
                        <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {feature.pill}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                    <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-700">
                      {feature.title === "Content Library" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">Add New Creator</span>
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white">
                              Add
                            </span>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
                            Paste LinkedIn profile URL…
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
                            See bangers vs. mid at a glance.
                          </div>
                        </div>
                      )}
                      {feature.title === "Create with AI" && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <MessageCircle className="h-4 w-4 text-emerald-500" />
                            Use as inspo → rewrite
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                            “Make it punchier and add a CTA to book a demo…”
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                            AI keeps the cadence and tone from your library.
                          </div>
                        </div>
                      )}
                      {feature.title === "Profile Intelligence" && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-800">Profile Intelligence</span>
                            <span className="text-sm font-bold text-slate-800">65%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200">
                            <div className="h-2 w-[65%] rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" />
                          </div>
                          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
                            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">Basic Info</span>
                            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">Current Metrics</span>
                            <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">Background</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="mt-16 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Pricing that mirrors your reach</h2>
                <p className="mt-1 text-slate-600">Start simple, layer on AI and collaboration, and keep your money with a 30-day guarantee.</p>
              </div>
              <span className="hidden rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm shadow-slate-300 sm:inline-flex">
                Monthly, cancel anytime
              </span>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-blue-50/70 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(85,120,200,0.09),transparent_35%),radial-gradient(circle_at_85%_30%,rgba(0,0,0,0.05),transparent_30%)]" />
              <div className="relative grid gap-4 md:grid-cols-3">
                {pricingTiers.map((tier) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`flex flex-col gap-4 rounded-2xl border ${
                      tier.highlight ? "border-slate-900 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]" : "border-slate-200 bg-white/90 shadow-[0_10px_30px_rgba(15,23,42,0.05)]"
                    } px-5 py-6`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{tier.badge}</div>
                      {tier.highlight && (
                        <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white shadow-sm shadow-slate-300">
                          Most popular
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-semibold text-slate-900">{tier.name}</div>
                      <div className="flex items-baseline gap-1 text-4xl font-semibold text-slate-900">
                        {tier.price}
                        <span className="text-sm font-semibold text-slate-500">{tier.cadence}</span>
                      </div>
                      <p className="text-sm text-slate-600">{tier.blurb}</p>
                    </div>
                    <div className="space-y-2">
                      {tier.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2 text-sm text-slate-700">
                          <CheckCircle2 className={`mt-0.5 h-4 w-4 ${tier.highlight ? "text-sky-600" : "text-emerald-500"}`} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      href="/login"
                      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        tier.highlight
                          ? "bg-slate-900 text-white shadow-md shadow-slate-300 hover:-translate-y-[1px] hover:bg-black"
                          : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:-translate-y-[1px] hover:shadow-md"
                      }`}
                    >
                      Choose {tier.name}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section id="cta" className="mt-16">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-blue-50 px-6 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:px-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(85,120,200,0.12),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(15,23,42,0.06),transparent_30%)]" />
              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
                    Ready today
                  </div>
                  <h3 className="text-3xl font-semibold text-slate-900">See Muse in your own workflow</h3>
                  <p className="text-slate-600">
                    Add a creator, pull their feed, and ship a rewritten post in minutes. The homepage now mirrors the
                    product you&apos;ll use every day.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/dashboard/create"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-300 transition hover:-translate-y-[1px] hover:bg-black"
                  >
                    Start free
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
