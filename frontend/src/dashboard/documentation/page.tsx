"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  FolderOpen,
  Highlighter,
  MessageCircle,
  MessageSquare,
  Mic,
  NotebookPen,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  UserPlus,
  UserRound,
  Wand2,
} from "lucide-react";

type DocumentationStep = {
  id: string;
  title: string;
  summary: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  ctaHref: string;
  icon: ElementType;
  preview: ReactNode;
  previewEmbedPath?: string;
};

type PreviewInputFieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
};

const PreviewInputField = ({ label, value, multiline = false }: PreviewInputFieldProps) => (
  <label className="block space-y-1">
    <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
    {multiline ? (
      <textarea
        readOnly
        value={value}
        rows={3}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-800 focus:outline-none"
      />
    ) : (
      <input
        readOnly
        value={value}
        className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none"
      />
    )}
  </label>
);

const PreviewFilterChip = ({
  label,
  active = false,
  count,
}: {
  label: string;
  active?: boolean;
  count?: string;
}) => (
  <span
    className={`px-3 py-1 rounded-full text-xs font-semibold ${
      active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-500"
    }`}
  >
    {label}
    {count ? (
      <span className="ml-1 text-[10px] opacity-80">
        {count}
      </span>
    ) : null}
  </span>
);

const PersonalInfoPreview = () => (
  <div className="bg-white rounded-[28px] border border-gray-100 shadow-lg shadow-blue-500/5 p-6 space-y-5 text-gray-900 w-full">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Personal info</p>
        <p className="text-sm text-gray-700">Basics • 45% complete</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-gray-400">Voice mode</p>
          <p className="text-xs text-gray-500">Listening</p>
        </div>
        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
          <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-5" />
        </div>
      </div>
    </div>
    <div className="space-y-3">
      <PreviewInputField label="Full name" value="Avery Quinn" />
      <PreviewInputField
        label="One-line description"
        value="AI studio founder helping creators turn swipe files into launches"
        multiline
      />
    </div>
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span>Profile strength</span>
        <span>9 / 20 fields</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full w-2/3 bg-gradient-to-r from-blue-500 to-indigo-500" />
      </div>
    </div>
    <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600">
        <Mic className="w-4 h-4" />
      </div>
      <div>
        <p className="text-sm font-semibold text-blue-900">&ldquo;What&apos;s your brand voice?&rdquo;</p>
        <p className="text-xs text-blue-600">Warm, curious, founder-to-founder</p>
      </div>
    </div>
  </div>
);

const CreatorsPreview = () => {
  const sampleCreators = [
    { name: "Noah Patel", focus: "B2B GTM • 2.1x avg", isFollowing: true },
    { name: "Lena Ortiz", focus: "Short-form funnels • 1.7x avg", isFollowing: false },
  ];
  return (
    <div className="bg-white rounded-[28px] border border-gray-100 shadow-lg shadow-purple-500/5 p-6 space-y-5 text-gray-900 w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          readOnly
          value="Product storytelling"
          className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm text-gray-700"
        />
      </div>
      <div className="flex gap-2">
        <PreviewFilterChip label="All" active />
        <PreviewFilterChip label="Following" count="12" />
        <PreviewFilterChip label="Discover" count="34" />
      </div>
      <div className="space-y-3">
        {sampleCreators.map((creator) => (
          <div
            key={creator.name}
            className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">{creator.name}</p>
              <p className="text-xs text-gray-500">{creator.focus}</p>
            </div>
            <button
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                creator.isFollowing ? "bg-white border border-gray-200 text-gray-600" : "bg-gray-900 text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              {creator.isFollowing ? "Following" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ContentLibraryPreview = () => (
  <div className="bg-white rounded-[28px] border border-gray-100 shadow-lg shadow-orange-500/5 p-6 space-y-5 text-gray-900 w-full">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Content library</p>
        <p className="text-sm text-gray-700">12 creators • 186 posts</p>
      </div>
      <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">+ Add LinkedIn URL</button>
    </div>
    <div className="flex gap-2">
      <PreviewFilterChip label="All" active />
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600 flex items-center gap-1">
        <Flame className="w-3.5 h-3.5" />
        Bangers
      </span>
      <PreviewFilterChip label="Mid" />
    </div>
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3">
      <div className="flex items-center justify-between text-xs text-gray-500 uppercase tracking-wide">
        <span>Creator</span>
        <span>Reactions</span>
      </div>
      <div className="rounded-xl bg-white border border-gray-100 p-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Cam Rivera</p>
          <p className="text-xs text-gray-500">Last post • 2.4x avg reactions</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">3,482</p>
          <p className="text-xs text-gray-500">+1,940 vs avg</p>
        </div>
      </div>
      <div className="rounded-xl bg-white border border-gray-100 p-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Jess Mendez</p>
          <p className="text-xs text-gray-500">Newest import • 1.8x avg</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">1,920</p>
          <p className="text-xs text-gray-500">+780 vs avg</p>
        </div>
      </div>
    </div>
  </div>
);

const HighlightPreview = () => (
  <div className="bg-white rounded-[28px] border border-gray-100 shadow-lg shadow-indigo-500/5 p-6 space-y-5 text-gray-900 w-full">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-400">Creator feed</p>
        <p className="text-sm font-semibold text-gray-900">Levi Mae</p>
        <p className="text-xs text-gray-500">Ops & positioning • 4.2x reaction rate</p>
      </div>
      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600">
        Highlighted
      </span>
    </div>
    <p className="text-sm leading-relaxed text-gray-600">
      Most teams spend months on &ldquo;brand&rdquo;. Instead, ship a talk track you can deliver in 60 seconds and let momentum
      define the brand for you.
    </p>
    <div className="flex items-center justify-between">
      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold">
        <Sparkles className="w-3.5 h-3.5" />
        Use as inspiration
      </button>
      <p className="text-xs text-gray-400">Press H to toggle</p>
    </div>
  </div>
);

const ContextPreview = () => (
  <div className="bg-white rounded-[28px] border border-gray-100 shadow-lg shadow-emerald-500/5 p-6 space-y-5 text-gray-900 w-full">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Choice modal</p>
        <p className="text-sm text-gray-700">Similarity 65%</p>
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600">
        <SlidersHorizontal className="w-3.5 h-3.5" />
        Custom remix
      </span>
    </div>
    <div>
      <input
        type="range"
        defaultValue={65}
        className="w-full accent-blue-600"
        min={0}
        max={100}
      />
      <div className="flex justify-between text-[11px] text-gray-400 mt-1">
        <span>Fresh take</span>
        <span>Original feel</span>
      </div>
    </div>
    <div className="space-y-3">
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-3">
        <p className="text-[11px] uppercase tracking-wide text-gray-400 flex items-center gap-1">
          <MessageCircle className="w-3.5 h-3.5" />
          Muse asks
        </p>
        <p className="text-sm text-gray-700 mt-1">What product are we promoting in this draft?</p>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3">
        <p className="text-[11px] uppercase tracking-wide text-blue-500">You</p>
        <p className="text-sm text-blue-900 mt-1">
          Airtime — a drop-in audio studio for go-to-market teams. Mention we just opened beta.
        </p>
      </div>
    </div>
  </div>
);

const IterationPreview = () => (
  <div className="bg-white rounded-[28px] border border-gray-100 shadow-lg shadow-gray-500/10 p-6 space-y-5 text-gray-900 w-full">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">AI assistant</p>
        <p className="text-sm text-gray-700">Version 3 saved</p>
      </div>
      <span className="text-xs font-semibold text-emerald-600">Ready</span>
    </div>
    <textarea
      readOnly
      value="Give me a punchier hook for founders scrolling LinkedIn — keep the hero line but tighten the setup."
      className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-700 min-h-[120px]"
    />
    <div className="flex items-center justify-between">
      <p className="text-xs text-gray-500">Voice mode on • Auto-save enabled</p>
      <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold">
        <Wand2 className="w-3.5 h-3.5" />
        Edit content
      </button>
    </div>
  </div>
);

const steps: DocumentationStep[] = [
  {
    id: "profile",
    title: "Add your profile info",
    summary: "Tell Muse who you are so every suggestion feels personal.",
    description:
      "Start with the Personal Info workspace. It tracks how many fields you have filled, supports voice capture, and autosaves every answer so the AI always has accurate context.",
    highlights: [
      "Expand each category (Basics, Product, Metrics, Background, Achievements, Expertise) and answer the structured prompts.",
      "Toggle Voice Mode from the Profile Intelligence card to speak your answers while Muse transcribes.",
      "Muse autosaves to Supabase as you type, so you never lose progress even if you refresh.",
    ],
    ctaLabel: "Open Personal Info",
    ctaHref: "/dashboard/personal-info",
    icon: UserRound,
    preview: <PersonalInfoPreview />,
    previewEmbedPath: "/dashboard/personal-info",
  },
  {
    id: "creators",
    title: "Follow inspiring creators",
    summary: "Curate a bench of voices that fuel your prompts and swipe files.",
    description:
      "Head to the Creators tab to search, filter by Following or Discover, and follow/unfollow without losing your place. Muse only surfaces posts from the people you follow in the Create canvas.",
    highlights: [
      "Use search plus All / Following / Discover filters to explore the roster.",
      "Follow creators inline; we optimistically update the button and roll back if the API fails.",
      "Following a creator pipes their latest posts into the Create feed immediately.",
    ],
    ctaLabel: "Browse Creators",
    ctaHref: "/dashboard/creators",
    icon: Target,
    preview: <CreatorsPreview />,
    previewEmbedPath: "/dashboard/creators",
  },
  {
    id: "library",
    title: "Pull posts into your Content Library",
    summary: "Stockpile references by importing LinkedIn creators and filtering their bangers.",
    description:
      "The Content Library lets you paste LinkedIn profile URLs, fetch their posts, and analyze performance multipliers before you hop into Create. The All / Bangers / Mid filters make it easy to see what hit.",
    highlights: [
      "Paste a LinkedIn URL into \"Add New Creator\" to scrape their profile and posts.",
      "Toggle All / Bangers / Mid to study performance vs. each creator's average reactions.",
      "Scroll and we'll auto-load more posts; Muse also shows how many creators and posts are in the library.",
    ],
    ctaLabel: "Open Content Library",
    ctaHref: "/dashboard/content",
    icon: FolderOpen,
    preview: <ContentLibraryPreview />,
    previewEmbedPath: "/dashboard/content",
  },
  {
    id: "highlight",
    title: "Highlight inspiration in Create",
    summary: "Filter the Create feed and pin the post you want to remix.",
    description:
      "Inside the Create canvas, the left column shows posts from the creators you follow. Search across titles and authors, filter down to high-performing posts, and highlight one to send it into the Inspiration card.",
    highlights: [
      "Use search plus the Bangers / Mid filters to zero-in on the exact format you want to riff on.",
      "Click a card to highlight it - we show a toast and move the post into the Inspiration panel.",
      "Open any card to read the full post in a modal before deciding if it's the right reference.",
    ],
    ctaLabel: "Go to Create",
    ctaHref: "/dashboard/create",
    icon: Highlighter,
    preview: <HighlightPreview />,
    previewEmbedPath: "/dashboard/create",
  },
  {
    id: "context",
    title: "Pick a creation mode & share context",
    summary: "Decide how similar you want the remix and answer Muse's follow-up questions.",
    description:
      "After you highlight posts, Muse opens a Choice Modal. Use the similarity slider, then either jump straight to generation or open the Context Gathering flow, which supports voice mode and averages ~5 questions.",
    highlights: [
      "Use the 0-100% similarity slider to tell Muse how closely the draft should mirror the source.",
      "Choose \"Use as inspiration\" to answer personalized questions with text or voice input.",
      "Need speed? Hit \"No custom needed\" or skip questions - we'll still remix the highlighted post.",
    ],
    ctaLabel: "Continue in Create",
    ctaHref: "/dashboard/create",
    icon: MessageSquare,
    preview: <ContextPreview />,
  },
  {
    id: "iterate",
    title: "Shape the draft with the AI Assistant",
    summary: "Dictate edits, trigger AI rewrites, and keep every version.",
    description:
      "The AI Assistant + Edit History stack on the right side of Create. Speak or type what you want, fire an edit, then replay or copy any previous version into the editor when you get something you like.",
    highlights: [
      "Enable Voice Mode to dictate edit requests - we auto-stop listening after silence and trigger the edit.",
      "Use the Wand button to call `generateEdit`, which sends your note + context to the AI client.",
      "Every generation lands in Edit History so you can copy v1, v2, etc. back into the editor.",
    ],
    ctaLabel: "Iterate in Create",
    ctaHref: "/dashboard/create",
    icon: Wand2,
    preview: <IterationPreview />,
    previewEmbedPath: "/dashboard/create",
  },
];

export default function DocumentationPage() {
  const [activeStepId, setActiveStepId] = useState<string>(steps[0].id);
  const stepRefs = useRef<Record<string, HTMLElement | null>>({});
  const activeStepIndex = useMemo(() => steps.findIndex((step) => step.id === activeStepId), [activeStepId]);
  const activeStep = steps[Math.max(activeStepIndex, 0)];
  const activeStepRef = useRef(activeStepId);

  function handleNavClick(stepId: string) {
    setActiveStepId(stepId);
    const target = stepRefs.current[stepId];
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  useEffect(() => {
    activeStepRef.current = activeStepId;
  }, [activeStepId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const stepId = visible[0].target.getAttribute("data-step-id");
          if (stepId && stepId !== activeStepRef.current) {
            setActiveStepId(stepId);
          }
        }
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0.2,
      },
    );

    Object.values(stepRefs.current).forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="px-6 lg:px-10 py-8 pb-16 space-y-8 w-full max-w-[1800px] mx-auto">
      <div className="relative overflow-hidden rounded-[40px] bg-white text-gray-900 px-8 py-8 shadow-2xl border border-gray-100">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-16 w-72 h-72 bg-blue-100 rounded-full blur-3xl" />
          <div className="absolute top-20 right-10 w-48 h-48 bg-purple-100 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="flex-1">
            <p className="uppercase tracking-[0.35em] text-xs text-gray-400">Muse playbook</p>
            <h1 className="text-5xl font-semibold mt-2 text-gray-900">Documentation</h1>
            <p className="mt-4 text-gray-600 max-w-2xl leading-relaxed text-lg">
              Follow the exact path our power creators take. Each step unlocks a panel in the product,
              so you can tune Muse to your voice, gather the right inspiration, and ship polished drafts in minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/dashboard/content"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Browse saved content
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard/create"
                className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-900 px-5 py-2.5 rounded-2xl text-sm font-semibold shadow-sm hover:border-gray-300 transition-colors"
              >
                Start creating
                <Sparkles className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <div className="rounded-[28px] bg-gradient-to-br from-blue-500 to-purple-500 text-white p-6 shadow-lg min-w-[260px]">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Today&apos;s momentum</p>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-4xl font-semibold">6</p>
                  <p className="text-sm text-white/80">Steps to full setup</p>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-lg font-semibold">2 mins</p>
                  <p className="text-sm text-white/80">Avg time per step</p>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <p className="text-lg font-semibold">82%</p>
                  <p className="text-sm text-white/80">Creators complete this flow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1.1fr)_600px]">
        <div className="space-y-4">
          {steps.map((step, index) => {
            const isActive = step.id === activeStepId;
            const StepIcon = step.icon;
            return (
              <button
                type="button"
                key={step.id}
                onClick={() => handleNavClick(step.id)}
                className={`w-full text-left rounded-2xl border px-5 py-4 transition-all flex flex-col gap-3 ${
                  isActive
                    ? "border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md shadow-blue-500/10"
                    : "border-gray-200 bg-white/90 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      isActive ? "bg-white text-blue-600 shadow" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs tracking-widest uppercase ${isActive ? "text-blue-500" : "text-gray-400"}`}>
                      Step {index + 1}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{step.title}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{step.summary}</p>
              </button>
            );
          })}
        </div>

        <div className="space-y-10">
          {steps.map((step, index) => {
            const isActive = step.id === activeStepId;
            return (
              <section
                key={step.id}
                ref={(el) => {
                  stepRefs.current[step.id] = el;
                }}
                data-step-id={step.id}
                className={`bg-white rounded-3xl shadow-sm border p-6 lg:p-8 ${isActive ? "border-blue-100" : "border-gray-100"}`}
              >
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">
                      <NotebookPen className="w-4 h-4" />
                      Flow step {index + 1} of {steps.length}
                    </span>
                    <div className="text-xs text-gray-400 font-mono">/{step.id}</div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">{step.title}</h2>
                    <p className="text-gray-600 mt-3 leading-relaxed">{step.description}</p>
                  </div>
                  <div className="space-y-3">
                    {step.highlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="flex items-start gap-3 text-gray-700 p-3 border border-gray-100 rounded-2xl bg-gray-50/60"
                      >
                        <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <p className="text-sm leading-relaxed">{highlight}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-blue-600 font-semibold">Do it inside Muse</p>
                      <p className="text-sm text-blue-500 mt-1 leading-relaxed">
                        {step.ctaLabel}. We&apos;ll keep your progress synced to your workspace automatically.
                      </p>
                    </div>
                    <Link
                      href={step.ctaHref}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Go now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <aside className="rounded-[32px] border border-gray-100 bg-gradient-to-b from-white via-gray-50 to-white shadow-xl overflow-hidden h-fit sticky top-24 self-start">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Live preview</p>
              <p className="text-sm text-gray-600 mt-1">What this step looks like inside Muse</p>
            </div>
            <span className="text-[11px] font-mono text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
              {activeStep?.id}
            </span>
          </div>
          <div className="p-8 bg-gray-50/80 min-h-[200px]">
            {activeStep?.previewEmbedPath ? (
              <iframe
                src={`${activeStep.previewEmbedPath}?embed=docs`}
                className="w-full h-[620px] rounded-[24px] border border-gray-200 bg-white"
                loading="lazy"
              />
            ) : (
              <div className="space-y-6">{activeStep?.preview}</div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
