"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { personalInfoCategories } from "./personalInfoDataPoints";
import { ChevronDown, ChevronRight, Mic, Check, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { ProfileCoverageCard } from "../components/shared/ProfileCoverageCard";
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from "@/types";
import { getSpeechRecognition } from "@/types";
import { usePersonalInfoViewModel } from "./personalInfoViewModel";
import { extractionClient } from "@/services/extractionClient";

export default function PersonalInfoPage() {

  // Use ViewModel for data management
  const {
    formData,
    setFormData,
    updateField,
    isLoading,
    isSaving,
    hasUnsavedChanges,
  } = usePersonalInfoViewModel();

  // UI state (stays in component)
  const [activeField, setActiveField] = useState<string | null>(null);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [audioLevels, setAudioLevels] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionRunningRef = useRef(false);
  const isStartingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const wasSavingRef = useRef(false);

  // Show toast only when save completes (not on initial load)
  useEffect(() => {
    // Only show toast if we were just saving and now we're done
    if (wasSavingRef.current && !isSaving && !hasUnsavedChanges) {
      toast.success('Saved!', { autoClose: 1500 });
      wasSavingRef.current = false;
    } else if (isSaving) {
      wasSavingRef.current = true;
    }
  }, [isSaving, hasUnsavedChanges]);

  // Get all fields in order
  const getAllFields = useCallback(() => {
    const fields: string[] = [];
    personalInfoCategories.forEach(cat => {
      cat.dataPoints.forEach(dp => {
        fields.push(dp.id);
      });
    });
    return fields;
  }, []);

  // Start audio analysis for visualization
  const startAudioAnalysis = async (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

      const updateLevels = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        // Get 7 frequency bands for visualization
        const bands = 7;
        const levels: number[] = [];

        for (let i = 0; i < bands; i++) {
          // Use different parts of frequency spectrum
          const idx = Math.floor((i / bands) * dataArray.length);
          const value = dataArray[idx] || 0;
          // Normalize to 0-1 range with aggressive boost for better visibility
          // Lower threshold from 180 to 100 for more sensitivity
          levels.push(Math.min(1, (value / 100) * 1.5));
        }

        setAudioLevels(levels);
        animationFrameRef.current = requestAnimationFrame(updateLevels);
      };

      updateLevels();
    } catch (error) {
      // Audio analysis failed - non-critical feature
    }
  };

  // Stop audio analysis
  const stopAudioAnalysis = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevels([0, 0, 0, 0, 0, 0, 0]);
  };

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isRecognitionRunningRef.current = true;
      isStartingRef.current = false;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      // When we get a final result
      if (finalTranscript && activeField) {
        // Parse the natural language response to extract the actual value
        const fieldInfo = personalInfoCategories
          .flatMap(c => c.dataPoints)
          .find(d => d.id === activeField);

        if (fieldInfo) {
          parseAndExtractValue(finalTranscript.trim(), fieldInfo.label, activeField);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Speech recognition error - UI state already updated
      isRecognitionRunningRef.current = false;
      isStartingRef.current = false;
      setIsListening(false);

      if (event.error === "no-speech") {
        toast.error("No speech detected. Moving to next field...");
        skipField();
      } else if (event.error === "not-allowed") {
        toast.error("Microphone permission denied. Please allow microphone access.");
        setIsVoiceMode(false);
      } else if (event.error === "network") {
        toast.error("Speech service unavailable. Please use Chrome/Edge browser.");
        setIsVoiceMode(false);
      } else if (event.error !== "aborted") {
        toast.error(`Voice input failed: ${event.error}`);
      }
    };

    recognition.onend = () => {
      isRecognitionRunningRef.current = false;
      isStartingRef.current = false;
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      // Clean up media stream on unmount
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      // Clean up audio context
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      // Cancel animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
    // Functions use closure to access latest values - this effect intentionally only runs when activeField or isVoiceMode changes
  }, [activeField, isVoiceMode]);

  const handleInputChange = (fieldId: string, value: string) => {
    updateField(fieldId, value);
  };

  const parseAndExtractValue = async (transcript: string, fieldLabel: string, fieldId: string) => {
    setIsProcessing(true);
    try {
      // Use AI to extract the actual value from natural language
      const extractedValue = await extractionClient.extractFieldValue(transcript, fieldLabel);

      updateField(fieldId, extractedValue || transcript);

      // Move to next field
      setIsProcessing(false);
      moveToNextField();
    } catch (error) {
      // Fallback to raw transcript
      updateField(fieldId, transcript);
      setIsProcessing(false);
      moveToNextField();
    }
  };

  const moveToNextField = () => {
    const allFields = getAllFields();
    const currentIndex = allFields.indexOf(activeField!);
    const nextIndex = currentIndex + 1;

    if (nextIndex < allFields.length && isVoiceMode) {
      // Go to next field
      setTimeout(() => {
        setActiveField(allFields[nextIndex]);

        // Find the category for the next field
        const nextCategory = personalInfoCategories.find(cat =>
          cat.dataPoints.some(dp => dp.id === allFields[nextIndex])
        );

        // Only keep the next category open, close all others
        if (nextCategory) {
          setExpandedCategories(new Set([nextCategory.id]));
        }

        // Start listening for next field
        setTimeout(() => {
          startListening();
        }, 300);
      }, 500);
    } else {
      setIsListening(false);
      setActiveField(null);
      isRecognitionRunningRef.current = false;
      // Close all categories when done
      setExpandedCategories(new Set());
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      toast.error("Voice input not supported in this browser. Try Chrome or Edge.");
      return;
    }

    // Don't start if already listening or starting
    if (isListening || isStartingRef.current || isRecognitionRunningRef.current) {
      return;
    }

    try {
      // Check microphone permissions first
      const permissionStatus = await navigator.permissions.query({
        name: "microphone" as PermissionName
      });

      if (permissionStatus.state === "denied") {
        toast.error("Microphone access denied. Please enable it in browser settings.");
        setIsVoiceMode(false);
        return;
      }

      // Request microphone access to ensure permission is granted
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        // Start audio analysis for visualization
        startAudioAnalysis(stream);
      } catch (permError) {
        // Error is shown to user via toast
        toast.error("Could not access microphone. Please grant permission.");
        setIsVoiceMode(false);
        return;
      }

      isStartingRef.current = true;

      // Ensure recognition is fully stopped before starting
      if (isRecognitionRunningRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore errors
        }
        // Wait for it to fully stop
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setIsListening(true);

      // Start recognition
      try {
        recognitionRef.current.start();
        toast.info("Listening... Speak now!");
      } catch (error) {
        // Error is shown to user via toast
        isStartingRef.current = false;
        setIsListening(false);

        const errMsg = error instanceof Error ? error.message : String(error);
        if (errMsg.includes("already started")) {
          toast.error("Voice recognition is already active. Please wait.");
        } else {
          toast.error("Failed to start voice input. Please try again.");
        }
      }
    } catch (error) {
      // Error is shown to user via toast
      isStartingRef.current = false;
      setIsListening(false);
      toast.error("Failed to initialize voice input. Please try again.");
    }
  };

  const togglePause = () => {
    if (isPaused) {
      // Resume - start listening again
      setIsPaused(false);
      setTimeout(() => {
        startListening();
      }, 300);
    } else {
      // Pause - stop listening but keep voice mode active
      setIsPaused(true);
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      stopAudioAnalysis();
    }
  };

  const skipField = () => {
    if (!activeField) return;
    const allFields = getAllFields();
    const currentIndex = allFields.indexOf(activeField);
    const nextIndex = currentIndex + 1;

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    if (nextIndex < allFields.length) {
      setActiveField(allFields[nextIndex]);

      // Find the category for the next field
      const nextCategory = personalInfoCategories.find(cat =>
        cat.dataPoints.some(dp => dp.id === allFields[nextIndex])
      );

      // Only keep the next category open, close all others
      if (nextCategory) {
        setExpandedCategories(new Set([nextCategory.id]));
      }

      setTimeout(() => {
        startListening();
      }, 500);
    } else {
      setIsListening(false);
      setActiveField(null);
      setExpandedCategories(new Set());
    }
  };

  // When voice mode is toggled on, start at first empty field
  useEffect(() => {
    if (isVoiceMode && recognitionRef.current && !isListening) {
      const allFields = getAllFields();
      const firstEmptyField = allFields.find(fieldId => !formData[fieldId]?.trim());

      if (firstEmptyField) {
        // Find the category containing this field and only open that one
        const category = personalInfoCategories.find(cat =>
          cat.dataPoints.some(dp => dp.id === firstEmptyField)
        );
        if (category) {
          setExpandedCategories(new Set([category.id]));
        }

        setTimeout(() => {
          setActiveField(firstEmptyField);
          setTimeout(() => {
            startListening();
          }, 300);
        }, 300);
      }
    } else if (!isVoiceMode && recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setActiveField(null);
      stopAudioAnalysis();
      // Stop the media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }
    // Functions use closure to access latest values - this effect intentionally only runs when isVoiceMode changes
  }, [isVoiceMode]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const resetCategory = (categoryId: string) => {
    const category = personalInfoCategories.find(c => c.id === categoryId);
    if (category) {
      const newData = { ...formData };
      category.dataPoints.forEach(dp => {
        delete newData[dp.id];
      });
      setFormData(newData);
      toast.success(`Reset ${category.title}`);
    }
  };

  const resetAll = () => {
    setFormData({});
    toast.success("Reset all fields");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading your profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Saving indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-lg border border-gray-100 text-sm text-gray-500 z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* Left: Profile Intelligence / Voice Mode */}
          <div className="w-[500px] flex-shrink-0 sticky top-6 self-start">
            <ProfileCoverageCard
              categories={personalInfoCategories.map(cat => ({
                id: cat.id,
                title: cat.title,
                filled: cat.dataPoints.filter(dp => formData[dp.id]?.trim()).length,
                total: cat.dataPoints.length,
              }))}
              onStartVoiceMode={() => setIsVoiceMode(!isVoiceMode)}
              onPauseVoiceMode={togglePause}
              isVoiceActive={isVoiceMode}
              isListening={isListening}
              isProcessing={isProcessing}
              isPaused={isPaused}
              currentFieldQuestion={activeField ? personalInfoCategories.flatMap(c => c.dataPoints).find(d => d.id === activeField)?.question : undefined}
              onSkipField={skipField}
              audioLevels={audioLevels}
              onResetAll={resetAll}
              hasData={Object.keys(formData).length > 0}
            />
          </div>

          {/* Right: Form Fields */}
          <div className="flex-1 space-y-3">
          {personalInfoCategories.map((category) => {
            const isExpanded = expandedCategories.has(category.id);
            const filledCount = category.dataPoints.filter(dp => formData[dp.id]?.trim()).length;
            const totalCount = category.dataPoints.length;
            const percent = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

            const CATEGORY_COLORS: Record<string, string> = {
              basics: "#5578C8",
              product: "#7B61FF",
              metrics: "#00B894",
              background: "#F39C12",
              achievements: "#E74C3C",
              expertise: "#9B59B6",
            };
            const categoryColor = CATEGORY_COLORS[category.id] || "#5578C8";

            return (
              <div key={category.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full p-5 hover:bg-gray-50/50 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoryColor, boxShadow: `0 0 10px ${categoryColor}50` }}
                      />
                      <span className="text-sm font-semibold text-gray-800">{category.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-500">{percent}%</span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: categoryColor }}
                    />
                  </div>

                  <p className="text-xs text-gray-400 text-left">
                    {filledCount} of {totalCount} fields complete
                  </p>
                </button>

                {/* Category Content */}
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                      {category.dataPoints.map((dataPoint) => {
                        const isActive = activeField === dataPoint.id && isListening;
                        const isFilled = formData[dataPoint.id]?.trim();
                        return (
                          <div key={dataPoint.id} className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              {dataPoint.label}
                              {isActive && (
                                <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-full animate-pulse">
                                  <Mic className="w-3 h-3" />
                                  Listening
                                </span>
                              )}
                              {isFilled && !isActive && (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                            </label>
                            {dataPoint.type === 'textarea' ? (
                              <textarea
                                value={formData[dataPoint.id] || ''}
                                onChange={(e) => handleInputChange(dataPoint.id, e.target.value)}
                                placeholder={dataPoint.placeholder}
                                className={`w-full min-h-[100px] text-sm text-gray-700 bg-gray-50 border-0 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:bg-white leading-relaxed placeholder:text-gray-400 transition-all ${
                                  isActive
                                    ? 'ring-2 ring-blue-500/30 bg-blue-50/50'
                                    : 'focus:ring-blue-500/20'
                                }`}
                              />
                            ) : (
                              <input
                                type="text"
                                value={formData[dataPoint.id] || ''}
                                onChange={(e) => handleInputChange(dataPoint.id, e.target.value)}
                                placeholder={dataPoint.placeholder}
                                className={`w-full text-sm text-gray-700 bg-gray-50 border-0 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:bg-white placeholder:text-gray-400 transition-all ${
                                  isActive
                                    ? 'ring-2 ring-blue-500/30 bg-blue-50/50'
                                    : 'focus:ring-blue-500/20'
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}

                      {/* Reset section button */}
                      {filledCount > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetCategory(category.id);
                          }}
                          className="mt-4 flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reset {category.title}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
