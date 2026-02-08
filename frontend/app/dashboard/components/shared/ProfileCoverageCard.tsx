"use client";

import { useEffect, useState, useRef } from "react";
import { Mic, SkipForward, RotateCcw, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CategoryProgress {
  id: string;
  title: string;
  filled: number;
  total: number;
}

interface ProfileCoverageCardProps {
  categories: CategoryProgress[];
  onStartVoiceMode?: () => void;
  onPauseVoiceMode?: () => void;
  isVoiceActive?: boolean;
  isListening?: boolean;
  isProcessing?: boolean;
  isPaused?: boolean;
  currentFieldQuestion?: string;
  onSkipField?: () => void;
  audioLevels?: number[];
  onResetAll?: () => void;
  hasData?: boolean;
}

const CATEGORY_COLORS: Record<string, { main: string; faded: string }> = {
  basics: { main: "#5578C8", faded: "#5578C825" },
  product: { main: "#7B61FF", faded: "#7B61FF25" },
  metrics: { main: "#00B894", faded: "#00B89425" },
  background: { main: "#F39C12", faded: "#F39C1225" },
  achievements: { main: "#E74C3C", faded: "#E74C3C25" },
  expertise: { main: "#9B59B6", faded: "#9B59B625" },
};

const ANALYSIS_MESSAGES = [
  "Analyzing profile depth...",
  "Calculating authenticity score...",
  "Mapping expertise areas...",
  "Processing achievements...",
  "Optimizing content match...",
  "Building personalization model...",
];

export function ProfileCoverageCard({ categories, onStartVoiceMode, onPauseVoiceMode, isVoiceActive, isListening, isProcessing, isPaused, currentFieldQuestion, onSkipField, audioLevels = [0, 0, 0, 0, 0], onResetAll, hasData }: ProfileCoverageCardProps) {
  const totalFilled = categories.reduce((acc, cat) => acc + cat.filled, 0);
  const totalFields = categories.reduce((acc, cat) => acc + cat.total, 0);
  const percentage = totalFields > 0 ? Math.round((totalFilled / totalFields) * 100) : 0;

  const [displayPercent, setDisplayPercent] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState("");
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);
  const prevFilledRef = useRef(totalFilled);
  const particleIdRef = useRef(0);

  // Trigger analysis animation when data changes
  useEffect(() => {
    if (totalFilled !== prevFilledRef.current) {
      setIsAnalyzing(true);

      let msgIndex = 0;
      const msgInterval = setInterval(() => {
        setAnalysisMessage(ANALYSIS_MESSAGES[msgIndex % ANALYSIS_MESSAGES.length]);
        msgIndex++;
      }, 400);

      // Spawn particles
      const newParticles: Array<{ id: number; x: number; y: number; color: string }> = [];
      const colors = Object.values(CATEGORY_COLORS).map(c => c.main);
      for (let i = 0; i < 15; i++) {
        newParticles.push({
          id: particleIdRef.current++,
          x: 30 + Math.random() * 40,
          y: 20 + Math.random() * 40,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      setParticles(prev => [...prev, ...newParticles]);

      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisMessage("");
        clearInterval(msgInterval);
      }, 2500);

      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 3500);

      prevFilledRef.current = totalFilled;
    }
  }, [totalFilled]);

  // Animate percentage counter
  useEffect(() => {
    const duration = 1200;
    const steps = 60;
    const startValue = displayPercent;
    const diff = percentage - startValue;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + diff * eased;

      if (step >= steps) {
        setDisplayPercent(percentage);
        clearInterval(timer);
      } else {
        setDisplayPercent(Math.round(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [percentage, displayPercent]);

  // Ring dimensions
  const size = 440;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const gapSize = 30;
  const totalGaps = categories.length * gapSize;
  const availableCircumference = circumference - totalGaps;

  let currentOffset = 0;
  const segments = categories.map((cat) => {
    const catProportion = totalFields > 0 ? cat.total / totalFields : 1 / categories.length;
    const segmentLength = catProportion * availableCircumference;
    const fillRatio = cat.total > 0 ? cat.filled / cat.total : 0;
    const filledLength = segmentLength * fillRatio;

    const colors = CATEGORY_COLORS[cat.id] || { main: "#5578C8", faded: "#5578C820" };
    const segment = {
      ...cat,
      mainColor: colors.main,
      fadedColor: colors.faded,
      offset: currentOffset,
      totalLength: segmentLength,
      filledLength: filledLength,
      percent: Math.round(fillRatio * 100),
    };
    currentOffset += segmentLength + gapSize;
    return segment;
  });

  return (
    <div className="relative rounded-3xl bg-white border border-gray-100 shadow-sm px-16 py-10 overflow-hidden">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-[0.4] rounded-3xl"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: isAnalyzing ? 'pulse 0.5s ease-in-out infinite' : undefined,
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            backgroundColor: particle.color,
            boxShadow: `0 0 20px ${particle.color}`,
            animation: 'float-up 3s ease-out forwards',
          }}
        />
      ))}


      <div className="relative flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          <h2 className="text-gray-400 text-xs font-medium tracking-[0.3em] uppercase">
            {isAnalyzing ? 'Analyzing' : 'Profile Intelligence'}
          </h2>
          <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
        </div>

        {/* Ring Container */}
        <div className="relative" style={{ width: size, height: size }}>


          <svg width={size} height={size} className="transform -rotate-90 relative z-10">

            {/* Background segments */}
            {segments.map((seg) => (
              <circle
                key={`bg-${seg.id}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.fadedColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${seg.totalLength} ${circumference - seg.totalLength}`}
                strokeDashoffset={-seg.offset}
              />
            ))}

            {/* Filled segments */}
            {segments.map((seg) => (
              <circle
                key={`fill-${seg.id}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.mainColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${seg.filledLength} ${circumference - seg.filledLength}`}
                strokeDashoffset={-seg.offset}
                style={{
                  transition: "stroke-dasharray 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  opacity: seg.filledLength > 0 ? 1 : 0,
                }}
              />
            ))}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
            {/* Processing State - Show spinner */}
            {isProcessing ? (
              <div className="flex flex-col items-center text-center px-8">
                <div className="relative flex items-center justify-center mb-5 py-4">
                  {/* Animated processing circles */}
                  <div className="absolute rounded-full bg-amber-500/20 animate-ping" style={{ width: '120px', height: '120px' }} />
                  <div className="absolute rounded-full bg-amber-500/30 animate-pulse" style={{ width: '90px', height: '90px' }} />

                  {/* Center processing icon */}
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-xl shadow-amber-500/30 z-10">
                    <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
                <p className="text-lg font-semibold text-amber-600">Processing...</p>
              </div>
            ) : isListening && currentFieldQuestion ? (
              /* Voice Mode Active - Listening State */
              <div className="flex flex-col items-center text-center px-8">
                {/* Voice Circle - Pings based on volume */}
                <div className="relative flex items-center justify-center mb-5 py-4">
                  {/* Pinging circles based on audio level - more layers for better visibility */}
                  <div
                    className="absolute rounded-full bg-[#5578C8]/15 transition-all duration-150 ease-out"
                    style={{
                      width: `${100 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 120}px`,
                      height: `${100 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 120}px`,
                    }}
                  />
                  <div
                    className="absolute rounded-full bg-[#5578C8]/25 transition-all duration-100 ease-out"
                    style={{
                      width: `${85 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 90}px`,
                      height: `${85 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 90}px`,
                    }}
                  />
                  <div
                    className="absolute rounded-full bg-[#5578C8]/35 transition-all duration-75 ease-out"
                    style={{
                      width: `${70 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 60}px`,
                      height: `${70 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 60}px`,
                    }}
                  />

                  {/* Center mic button - pulses with audio */}
                  <div
                    className="relative rounded-full bg-gradient-to-br from-[#5578C8] to-[#4A68B5] flex items-center justify-center shadow-xl shadow-blue-500/30 z-10 transition-all duration-100"
                    style={{
                      width: `${64 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 16}px`,
                      height: `${64 + (audioLevels.reduce((a, b) => a + b, 0) / audioLevels.length) * 16}px`,
                    }}
                  >
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                </div>
                <p className="text-sm font-medium text-blue-600">Listening...</p>
              </div>
            ) : (
              <>
                {/* Main percentage */}
                <div className={`relative transition-transform duration-300 ${isAnalyzing ? 'scale-105' : ''}`}>
                  <span className="text-[100px] font-black text-gray-800 tracking-tighter leading-none">
                    {displayPercent}
                  </span>
                  <span className="text-4xl font-bold text-gray-300 ml-1">%</span>
                </div>

                {/* Status line */}
                <div className="flex items-center gap-2 mt-3">
                  <div className={`h-[1px] w-8 ${isAnalyzing ? 'bg-amber-400' : 'bg-gray-200'} transition-colors`} />
                  <span className={`text-xs font-medium tracking-wider ${isAnalyzing ? 'text-amber-600' : 'text-gray-400'} transition-colors`}>
                    {isAnalyzing ? analysisMessage : `${totalFilled} OF ${totalFields} FIELDS`}
                  </span>
                  <div className={`h-[1px] w-8 ${isAnalyzing ? 'bg-amber-400' : 'bg-gray-200'} transition-colors`} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Question + Skip - Below Circle when listening (not processing) */}
        {isListening && currentFieldQuestion && !isProcessing && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-2xl font-bold text-gray-800 text-center mb-2">{currentFieldQuestion}</p>
            <div className="flex gap-2">
              {onPauseVoiceMode && (
                <Button
                  onClick={onPauseVoiceMode}
                  variant="secondary"
                  size="sm"
                >
                  <Pause className="w-4 h-4" />
                  Pause
                </Button>
              )}
              {onSkipField && (
                <Button
                  onClick={onSkipField}
                  variant="ghost"
                  size="sm"
                >
                  <SkipForward className="w-4 h-4" />
                  Skip
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Paused State - Show Resume button */}
        {isPaused && onPauseVoiceMode && (
          <div className="mt-8 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-3">Voice mode paused</p>
            <Button
              onClick={onPauseVoiceMode}
              variant="default"
              size="lg"
            >
              <Play className="w-5 h-5" />
              Resume
            </Button>
          </div>
        )}

        {/* Voice Mode Button - Below Circle (hidden when listening or paused) */}
        {onStartVoiceMode && !isListening && !isPaused && (
          <Button
            onClick={onStartVoiceMode}
            variant={isVoiceActive ? "secondary" : "default"}
            size="lg"
            className="mt-8"
          >
            <Mic className="w-5 h-5" />
            {isVoiceActive ? 'Stop' : 'Fill with Voice'}
          </Button>
        )}

        {/* Reset All Button */}
        {onResetAll && hasData && !isListening && (
          <Button
            onClick={onResetAll}
            variant="ghost"
            size="sm"
            className="mt-4"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </Button>
        )}

      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0);
          }
        }
        @keyframes shimmer {
          100% {
            transform: translateX(200%);
          }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
        @keyframes voice-wave {
          0%, 100% {
            transform: scaleY(0.3);
            opacity: 0.5;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        .animate-voice-wave {
          animation: voice-wave 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
