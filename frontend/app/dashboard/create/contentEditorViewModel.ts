import { useState, useEffect, useMemo, useRef } from "react";
import type { ContentPost } from "@/types";
import { aiClient } from "@/services/aiClient";

export interface UserContext {
  [key: string]: string;
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
}

export function useContentEditorViewModel(highlightedPosts: ContentPost[]) {
  const [userContent, setUserContent] = useState("");
  const [isGeneratingInitial, setIsGeneratingInitial] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [similarity, setSimilarity] = useState(50); // Track similarity from choice modal
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>([]);
  const lastGeneratedIdsRef = useRef("");
  const isInitialMount = useRef(true);

  // Track post IDs to detect actual changes
  const highlightedPostIds = useMemo(() =>
    highlightedPosts.map(p => p.id).join(','),
    [highlightedPosts]
  );

  // Show choice modal when posts are selected
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Don't re-show if same posts
    if (lastGeneratedIdsRef.current === highlightedPostIds) {
      return;
    }

    if (highlightedPosts.length === 0) {
      setUserContent("");
      lastGeneratedIdsRef.current = "";
      return;
    }

    // Show choice modal
    setShowChoiceModal(true);
    lastGeneratedIdsRef.current = highlightedPostIds;
  }, [highlightedPostIds, highlightedPosts]);

  /**
   * Handle completion of context gathering modal
   * Extracts Q&A pairs from conversation history and sends to AI for content generation
   * The AI uses this context to personalize the generated content for the user's company/industry
   */
  const handleContextComplete = async (history: ChatMessage[]) => {
    setConversationHistory(history);
    setShowContextModal(false);
    setIsGeneratingInitial(true);

    try {
      // Combine all highlighted posts into one text block
      const combinedContent = highlightedPosts
        .map((post) => post.postRaw || "")
        .join("\n\n");

      // Build context object from conversation history
      // Conversation alternates: user question, assistant answer, user question, assistant answer...
      // We extract these pairs into a key-value object for the AI prompt
      const context: UserContext = {};
      for (let i = 0; i < history.length; i += 2) {
        const question = history[i]?.content;
        const answer = history[i + 1]?.content;
        if (question && answer) {
          context[question] = answer;
        }
      }

      // Generate AI-edited content with user's context and similarity setting
      const data = await aiClient.generateEdit({
        text: combinedContent,
        context,
        similarity, // Use similarity from state
      });

      setUserContent(data.suggestedText || "");
    } catch (error) {
      // Fallback: show original content if AI generation fails
      const combinedContent = highlightedPosts
        .map((post) => post.postRaw || "")
        .join("\n\n");
      setUserContent(combinedContent);
    } finally {
      setIsGeneratingInitial(false);
    }
  };

  const handleContextSkip = async () => {
    setShowContextModal(false);
    setIsGeneratingInitial(true);

    try {
      const combinedContent = highlightedPosts
        .map((post) => post.postRaw || "")
        .join("\n\n");

      const data = await aiClient.generateEdit({
        text: combinedContent,
        context: {},
      });

      setUserContent(data.suggestedText || "");
    } catch (error) {
      // Fallback to original content if AI generation fails
      const combinedContent = highlightedPosts
        .map((post) => post.postRaw || "")
        .join("\n\n");
      setUserContent(combinedContent);
    } finally {
      setIsGeneratingInitial(false);
    }
  };

  const getPostContent = () => {
    return highlightedPosts.map((post) => post.postRaw || "").join("\n\n");
  };

  const closeContextModal = () => {
    setShowContextModal(false);
  };

  const closeChoiceModal = () => {
    setShowChoiceModal(false);
  };

  // Handler for "Use as inspiration" - opens customization modal
  const handleUseAsInspiration = (simValue: number) => {
    setSimilarity(simValue);
    setShowChoiceModal(false);
    setShowContextModal(true);
  };

  // Handler for "No custom needed" - generates immediately with similarity
  const handleNoCustomNeeded = async (simValue: number) => {
    setSimilarity(simValue);
    setShowChoiceModal(false);
    setIsGeneratingInitial(true);

    try {
      const combinedContent = highlightedPosts
        .map((post) => post.postRaw || "")
        .join("\n\n");

      const data = await aiClient.generateEdit({
        text: combinedContent,
        context: {},
        similarity: simValue,
      });

      setUserContent(data.suggestedText || "");
    } catch (error) {
      // Fallback to original content if AI generation fails
      const combinedContent = highlightedPosts
        .map((post) => post.postRaw || "")
        .join("\n\n");
      setUserContent(combinedContent);
    } finally {
      setIsGeneratingInitial(false);
    }
  };

  return {
    userContent,
    setUserContent,
    isGeneratingInitial,
    showContextModal,
    showChoiceModal,
    conversationHistory,
    handleContextComplete,
    handleContextSkip,
    closeContextModal,
    closeChoiceModal,
    handleUseAsInspiration,
    handleNoCustomNeeded,
    getPostContent,
  };
}
