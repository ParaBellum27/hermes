/**
 * ViewModel for Personal Info Page
 * Handles business logic and state management for user profile data
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks";

export interface PersonalInfoData {
  [key: string]: string;
}

export interface PersonalInfoViewModel {
  // State
  formData: PersonalInfoData;
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  setFormData: (data: PersonalInfoData) => void;
  updateField: (fieldId: string, value: string) => void;

  // Status
  hasUnsavedChanges: boolean;
}

export function usePersonalInfoViewModel(): PersonalInfoViewModel {
  const { user } = useAuth();
  const [formData, setFormData] = useState<PersonalInfoData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>("");
  const hasInitiallyLoadedRef = useRef(false);

  // Load personal info on mount
  useEffect(() => {
    async function loadData() {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('[PersonalInfo] Loading for user_id:', user.id);
        const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/user-data/personal-info?user_id=${user.id}`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error('[PersonalInfo] Failed to load:', errorData);
          throw new Error('Failed to load personal info');
        }
        const { data } = await res.json();

        console.log('[PersonalInfo] Loaded data:', data);
        setFormData(data || {});
        lastSavedDataRef.current = JSON.stringify(data || {});
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error loading personal info:', error);
        // Set empty object on error so form still works
        setFormData({});
        lastSavedDataRef.current = JSON.stringify({});
      } finally {
        setIsLoading(false);
        // Mark as initially loaded after a short delay to prevent immediate save
        setTimeout(() => {
          hasInitiallyLoadedRef.current = true;
        }, 100);
      }
    }

    loadData();
  }, [user]);

  // Auto-save with debouncing
  useEffect(() => {
    // Don't save during initial load or before data has loaded
    if (isLoading || !hasInitiallyLoadedRef.current || !user) return;

    // Don't save if data hasn't actually changed
    const currentDataStr = JSON.stringify(formData);
    if (currentDataStr === lastSavedDataRef.current) {
      setHasUnsavedChanges(false);
      return;
    }

    setHasUnsavedChanges(true);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      // Double-check data has changed before saving
      const dataStr = JSON.stringify(formData);
      if (dataStr !== lastSavedDataRef.current) {
        try {
          setIsSaving(true);

          const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API_BASE_URL}/api/user-data/personal-info`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, data: formData }),
          });

          if (!res.ok) throw new Error('Failed to save personal info');

          lastSavedDataRef.current = dataStr;
          setHasUnsavedChanges(false);
        } catch (error) {
          // Error is re-thrown to be handled by caller
          throw error;
        } finally {
          setIsSaving(false);
        }
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, isLoading, user]);

  const updateField = useCallback((fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  return {
    formData,
    isLoading,
    isSaving,
    hasUnsavedChanges,
    setFormData,
    updateField,
  };
}
