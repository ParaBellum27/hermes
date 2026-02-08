import { useState, useRef, useEffect, useCallback } from "react";
import { aiClient } from "@/services/aiClient";
import { useAuth } from "@/hooks";
import { logger } from "@/lib/logger";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

type ModalStep = "initial" | "analyzing" | "questioning" | "ready";

interface AnalysisQuestion {
  field: string;
  question: string;
  why: string;
}

interface PostAnalysis {
  analysis: string;
  dataPoints: string[];
  questions: AnalysisQuestion[];
}

export function useContextGatheringViewModel(postContent: string) {
  const { user } = useAuth();
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
    []
  );
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [isReadyToGenerate, setIsReadyToGenerate] = useState(false);
  const [modalStep, setModalStep] = useState<ModalStep>("analyzing");
  const [profileData, setProfileData] = useState<Record<string, string>>({});
  const [postAnalysis, setPostAnalysis] = useState<PostAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const hasAnalyzedRef = useRef(false);

  // Load profile data from user profile service
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;

      try {
        const url = `${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/user-data/personal-info?user_id=${user.id}`;
        console.log('[ContextGathering] Fetching profile from:', url);
        const res = await fetch(url);
        console.log('[ContextGathering] Profile fetch status:', res.status);
        if (!res.ok) {
          throw new Error('Failed to load personal info');
        }
        const { data } = await res.json();

        if (data) {
          console.log('[ContextGathering] Loaded profile data:', data);
          setProfileData(data);
        } else {
          console.log('[ContextGathering] No profile data found');
        }
      } catch {
        // No profile data yet, that's fine
      }
    }

    loadProfile();
  }, [user]);

  // Apply current profile data directly
  const applyCurrentInfo = useCallback(() => {
    // Convert profile data to conversation format so content generation can use it
    const contextMessages: ChatMessage[] = [];

    if (profileData.fullName) contextMessages.push({ role: "user", content: `My name is ${profileData.fullName}` });
    if (profileData.currentTitle) contextMessages.push({ role: "user", content: `I'm a ${profileData.currentTitle}` });
    if (profileData.companyName) contextMessages.push({ role: "user", content: `At ${profileData.companyName}` });
    if (profileData.industry) contextMessages.push({ role: "user", content: `In the ${profileData.industry} industry` });
    if (profileData.productName) contextMessages.push({ role: "user", content: `Building ${profileData.productName}` });
    if (profileData.targetCustomer) contextMessages.push({ role: "user", content: `For ${profileData.targetCustomer}` });
    if (profileData.productDescription) contextMessages.push({ role: "user", content: `Which ${profileData.productDescription}` });

    setConversationHistory(contextMessages);
    setIsReadyToGenerate(true);
  }, [profileData]);

  // Reset when post content changes
  useEffect(() => {
    hasAnalyzedRef.current = false;
  }, [postContent]);

  // Auto-start personalization when we have post content and profile data is loaded
  useEffect(() => {
    if (!postContent || hasAnalyzedRef.current) return;

    const doStartPersonalization = async () => {
      setModalStep("questioning");
      setIsAskingQuestion(true);

      try {
        // Pass profile data so AI knows what we already have
        console.log('[ContextGathering] Sending to AI:', { profileData, postContentLength: postContent.length });
        const data = await aiClient.askQuestion({
          postContent,
          conversationHistory: [],
          existingContext: profileData,
        });
        console.log('[ContextGathering] AI response:', data);

        if (data.ready) {
          // If AI says we have enough, add confirmation message and generate immediately
          setConversationHistory([
            { role: "assistant", content: "I have everything I need from your profile to personalize this content!" },
          ]);
          setIsReadyToGenerate(true);
        } else if (data.question) {
          // AI asks first question about what's missing
          setConversationHistory([
            { role: "assistant", content: data.question },
          ]);
        }
      } catch (error) {
        // Error is shown to user via toast or UI state
        // Fallback: just use profile data
        applyCurrentInfo();
      } finally {
        setIsAskingQuestion(false);
      }
    };

    // Small delay to ensure profile data is loaded
    const timer = setTimeout(() => {
      if (!hasAnalyzedRef.current) {
        hasAnalyzedRef.current = true;
        doStartPersonalization();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [postContent, profileData, applyCurrentInfo]);


  // Get what profile fields are filled vs missing
  const getProfileSummary = () => {
    const keyFields = ['fullName', 'currentTitle', 'companyName', 'industry', 'productName', 'targetCustomer'];
    const filled = keyFields.filter(key => profileData[key]?.trim());
    const missing = keyFields.filter(key => !profileData[key]?.trim());
    return { filled, missing, hasData: filled.length > 0 };
  };

  // Start with personalization - ask the LLM what's needed (it knows profile data)
  const startPersonalization = async () => {
    setModalStep("questioning");
    setIsAskingQuestion(true);

    try {
      // Pass profile data so AI knows what we already have
      const data = await aiClient.askQuestion({
        postContent,
        conversationHistory: [],
        existingContext: profileData,
      });

      if (data.ready) {
        // If AI says we have enough, add confirmation message and generate immediately
        setConversationHistory([
          { role: "assistant", content: "I have everything I need from your profile to personalize this content!" },
        ]);
        setIsReadyToGenerate(true);
      } else if (data.question) {
        // AI asks first question about what's missing
        setConversationHistory([
          { role: "assistant", content: data.question },
        ]);
      }
    } catch (error) {
      logger.error("Failed to start personalization", error);
      // Fallback: just use profile data
      applyCurrentInfo();
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleSubmitAnswer = useCallback(async () => {
    if (!currentAnswer.trim()) return;

    const updatedHistory = [
      ...conversationHistory,
      { role: "user" as const, content: currentAnswer },
    ];

    setConversationHistory(updatedHistory);
    setCurrentAnswer("");
    setIsAskingQuestion(true);

    try {
      // Pass profile data as existing context
      const data = await aiClient.askQuestion({
        postContent,
        conversationHistory: updatedHistory,
        existingContext: profileData,
      });

      if (data.ready) {
        // Add a final confirmation message to keep UI consistent before modal closes
        setConversationHistory([
          ...updatedHistory,
          { role: "assistant", content: "Perfect! I have all the information I need to personalize this content for you." },
        ]);
        setIsReadyToGenerate(true);
      } else if (data.question) {
        setConversationHistory([
          ...updatedHistory,
          { role: "assistant", content: data.question },
        ]);
      }
    } catch (error) {
      // Error getting next question - add confirmation message and proceed
      setConversationHistory([
        ...updatedHistory,
        { role: "assistant", content: "Got it! Let me use what you've shared to create your content." },
      ]);
      setIsReadyToGenerate(true);
    } finally {
      setIsAskingQuestion(false);
    }
  }, [currentAnswer, conversationHistory, profileData, postContent]);

  const handleSkip = () => {
    setIsReadyToGenerate(true);
  };

  const reset = () => {
    setConversationHistory([]);
    setCurrentAnswer("");
    setIsReadyToGenerate(false);
    setIsAskingQuestion(false);
    setModalStep("analyzing");
    setPostAnalysis(null);
    setIsAnalyzing(true);
    hasAnalyzedRef.current = false;
  };

  return {
    conversationHistory,
    currentAnswer,
    setCurrentAnswer,
    isAskingQuestion,
    isReadyToGenerate,
    modalStep,
    profileData,
    postAnalysis,
    isAnalyzing,
    getProfileSummary,
    handleSubmitAnswer,
    handleSkip,
    startPersonalization,
    applyCurrentInfo,
    reset,
  };
}
