import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { aiClient } from "@/services/aiClient";
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from "@/types";
import { getSpeechRecognition } from "@/types";

export interface GeneratedVersion {
  suggestedText: string;
  additions: number;
  deletions: number;
  timestamp: number;
}

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export function useSuggestedEditsViewModel(
  externalContent: string = "",
  userContext?: {
    company?: string;
    industry?: string;
    targetAudience?: string;
    personalExperience?: string;
    writingStyle?: string;
  }
) {
  const [inputText, setInputText] = useState(externalContent);
  const [feedbackText, setFeedbackText] = useState("");
  const [currentVersion, setCurrentVersion] = useState<GeneratedVersion | null>(
    null
  );
  const [versionHistory, setVersionHistory] = useState<GeneratedVersion[]>([]);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const interimTranscriptRef = useRef("");
  const isRecognitionRunningRef = useRef(false);
  const isStartingRef = useRef(false);

  // Sync with external content
  useEffect(() => {
    setInputText(externalContent);
    // Reset conversation when new content is loaded
    setConversationHistory([]);
    setCurrentVersion(null);
  }, [externalContent]);

  const [shouldAutoGenerate, setShouldAutoGenerate] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Show interim results
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isRecognitionRunningRef.current = true;
      isStartingRef.current = false;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {

      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Show interim results in real-time
      if (interimTranscript) {
        interimTranscriptRef.current = interimTranscript;
        setFeedbackText(interimTranscript);
      }

      // When we get a final result
      if (finalTranscript) {
        setFeedbackText(finalTranscript);
        interimTranscriptRef.current = "";

        // Clear any existing silence timeout and countdown
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }

        // Start countdown from 3 seconds
        let timeLeft = 3.0;
        setSilenceCountdown(timeLeft);

        countdownIntervalRef.current = setInterval(() => {
          timeLeft -= 0.1;
          if (timeLeft <= 0) {
            if (countdownIntervalRef.current) {
              clearInterval(countdownIntervalRef.current);
            }
            setSilenceCountdown(null);
          } else {
            setSilenceCountdown(Number(timeLeft.toFixed(1)));
          }
        }, 100);

        // Set a timeout to stop listening after 3 seconds of silence
        silenceTimeoutRef.current = setTimeout(() => {
          setIsListening(false);
          if (recognitionRef.current) {
            recognitionRef.current.stop();
          }
          setSilenceCountdown(null);
          if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
          }

          // Trigger auto-generation
          if (finalTranscript.trim()) {
            setShouldAutoGenerate(true);
          }
        }, 3000);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Speech recognition error - UI state already updated
      isRecognitionRunningRef.current = false;
      isStartingRef.current = false;
      setIsListening(false);
      setSilenceCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      if (event.error === "no-speech") {
        toast.error("No speech detected. Please try again.");
      } else if (event.error === "not-allowed") {
        toast.error(
          "Microphone permission denied. Please allow microphone access in your browser settings."
        );
        setIsVoiceMode(false);
      } else if (event.error === "aborted") {
        // Silently ignore aborted errors (expected during cleanup)
      } else if (event.error === "network") {
        toast.error("Speech service unavailable. Try: 1) Check internet connection 2) Use Chrome/Edge 3) Ensure site is on HTTPS");
        setIsVoiceMode(false);
      } else if (event.error === "service-not-allowed") {
        toast.error("Speech recognition blocked. Check your browser permissions.");
        setIsVoiceMode(false);
      } else {
        toast.error(`Voice input failed: ${event.error}`);
      }
    };

    recognition.onend = () => {
      isRecognitionRunningRef.current = false;
      isStartingRef.current = false;
      setIsListening(false);
      setSilenceCountdown(null);
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleVoiceMode = () => {
    const newVoiceMode = !isVoiceMode;
    setIsVoiceMode(newVoiceMode);

    // If turning off voice mode, stop listening
    if (!newVoiceMode && isListening) {
      stopListening();
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      toast.error(
        "Voice input not supported in this browser. Try Chrome or Edge."
      );
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
        await navigator.mediaDevices.getUserMedia({ audio: true });
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

      // Clear any existing timers
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }

      setIsListening(true);
      setFeedbackText("");
      setSilenceCountdown(null);

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

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const generateEdit = useCallback(async () => {
    if (!inputText.trim() || !feedbackText.trim()) return;

    setIsGenerating(true);
    try {
      // Add user's feedback to conversation
      const updatedHistory: ConversationMessage[] = [
        ...conversationHistory,
        { role: "user", content: feedbackText },
      ];

      const data = await aiClient.generateEdit({
        text: inputText,
        prompt: feedbackText,
        context: userContext,
        conversationHistory: updatedHistory,
      });

      const newVersion: GeneratedVersion = {
        suggestedText: data.suggestedText,
        additions: data.additions,
        deletions: data.deletions,
        timestamp: Date.now(),
      };

      // Add AI's response to conversation
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: data.suggestedText },
      ]);

      setCurrentVersion(newVersion);
      setVersionHistory((prev) => [...prev, newVersion]);
      setFeedbackText(""); // Clear feedback for next iteration
      toast.success("Content edited!");
    } catch (error) {
      // Error is shown to user via toast
      toast.error(
        `Failed to generate edits: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  }, [inputText, feedbackText, conversationHistory, userContext]);

  // Auto-generate after voice input
  useEffect(() => {
    if (shouldAutoGenerate && feedbackText.trim() && inputText.trim()) {
      setShouldAutoGenerate(false);
      setTimeout(() => {
        generateEdit();
      }, 500);
    }
  }, [shouldAutoGenerate, feedbackText, inputText, generateEdit]);

  const playTextToSpeech = async (text: string) => {
    try {
      setIsPlaying(true);

      const audioBlob = await aiClient.generateTextToSpeech({
        text,
        voice: "alloy",
      });
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      // Error is shown to user via toast
      toast.error("Failed to play audio");
      setIsPlaying(false);
    }
  };

  const handlePlay = async () => {
    if (!currentVersion) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    await playTextToSpeech(currentVersion.suggestedText);
  };

  const handleReset = () => {
    setCurrentVersion(null);

    // In voice mode, auto-start listening for next edit
    if (isVoiceMode) {
      setTimeout(() => {
        startListening();
      }, 500);
    }
  };

  const handleClearAll = () => {
    setFeedbackText("");
    setCurrentVersion(null);
    setVersionHistory([]);
    setConversationHistory([]);
  };

  const handleCopyVersion = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return {
    // State
    inputText,
    feedbackText,
    currentVersion,
    versionHistory,
    isGenerating,
    isPlaying,
    isVoiceMode,
    isListening,
    silenceCountdown,

    // Computed
    isAiActive: isGenerating || isPlaying,

    // Actions
    setInputText,
    setFeedbackText,
    generateEdit,
    handlePlay,
    handleReset,
    handleClearAll,
    handleCopyVersion,
    toggleVoiceMode,
    startListening,
    stopListening,
  };
}
