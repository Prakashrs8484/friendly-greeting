import { useState, useCallback } from 'react';
import {
  updateFeatureData,
  getFeatureData,
} from '@/lib/agentPageApi';
import { useToast } from '@/hooks/use-toast';

interface SectionDataState {
  data: unknown[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

interface UseSectionDataResult extends SectionDataState {
  addItem: (item: unknown) => Promise<void>;
  updateItem: (index: number, updatedItem: unknown) => Promise<void>;
  deleteItem: (index: number) => Promise<void>;
  refreshData: () => Promise<void>;
  optimisticUpdate: (updates: unknown[]) => void;
  rollback: () => void;
}

/**
 * useSectionData Hook
 * Manages persistent feature data for dynamic sections
 * Handles optimistic updates with rollback, persistence, and error recovery
 */
export function useSectionData(
  pageId: string,
  featureId: string
): UseSectionDataResult {
  const { toast } = useToast();
  const [state, setState] = useState<SectionDataState>({
    data: [],
    isLoading: true,
    isSaving: false,
    error: null,
  });
  const [previousData, setPreviousData] = useState<unknown[]>([]);

  // Load initial data
  const loadData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await getFeatureData(pageId, featureId);
      const loadedData = response.featureData?.data || [];
      setState(prev => ({
        ...prev,
        data: loadedData,
        isLoading: false,
      }));
      setPreviousData(loadedData);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to load data';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMsg,
      }));
      toast({ title: 'Failed to load section data', variant: 'destructive' });
    }
  }, [pageId, featureId, toast]);

  // Save data to backend
  const saveData = useCallback(async (newData: unknown[]) => {
    setState(prev => ({ ...prev, isSaving: true }));
    try {
      await updateFeatureData(pageId, featureId, newData);
      setState(prev => ({
        ...prev,
        data: newData,
        isSaving: false,
      }));
      setPreviousData(newData);
      return true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to save data';
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMsg,
      }));
      toast({
        title: 'Failed to save changes',
        description: errorMsg,
        variant: 'destructive',
      });
      return false;
    }
  }, [pageId, featureId, toast]);

  // Add item with optimistic update
  const addItem = useCallback(async (item: unknown) => {
    const newData = [...state.data, item];
    // Optimistic update
    setState(prev => ({ ...prev, data: newData }));
    // Persist
    const success = await saveData(newData);
    if (!success) {
      // Rollback on error
      setState(prev => ({ ...prev, data: previousData }));
    }
  }, [state.data, previousData, saveData]);

  // Update item with optimistic update
  const updateItem = useCallback(async (index: number, updatedItem: unknown) => {
    const newData = [...state.data];
    newData[index] = updatedItem;
    // Optimistic update
    setState(prev => ({ ...prev, data: newData }));
    // Persist
    const success = await saveData(newData);
    if (!success) {
      // Rollback on error
      setState(prev => ({ ...prev, data: previousData }));
    }
  }, [state.data, previousData, saveData]);

  // Delete item with optimistic update
  const deleteItem = useCallback(async (index: number) => {
    const newData = state.data.filter((_, i) => i !== index);
    // Optimistic update
    setState(prev => ({ ...prev, data: newData }));
    // Persist
    const success = await saveData(newData);
    if (!success) {
      // Rollback on error
      setState(prev => ({ ...prev, data: previousData }));
    }
  }, [state.data, previousData, saveData]);

  // Refresh data from backend
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Manual optimistic update (for UI preview without saving)
  const optimisticUpdate = useCallback((updates: unknown[]) => {
    setState(prev => ({ ...prev, data: updates }));
  }, []);

  // Rollback to previous state
  const rollback = useCallback(() => {
    setState(prev => ({ ...prev, data: previousData }));
  }, [previousData]);

  return {
    ...state,
    addItem,
    updateItem,
    deleteItem,
    refreshData,
    optimisticUpdate,
    rollback,
  };
}
