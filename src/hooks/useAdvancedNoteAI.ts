// src/hooks/useAdvancedNoteAI.ts
import { useState, useCallback } from "react";
import {
  rewriteNoteApi,
  expandThoughtApi,
  sceneBuilderApi,
  characterBuilderApi,
  dialogueEnhancerApi,
  ideaGeneratorApi,
  structureDocumentApi,
  bulletExtractorApi,
  actionItemsApi,
  academicImproveApi,
  argumentStrengthenerApi,
  compareTextsApi,
  autoTitleApi,
  autoTagsApi,
  outlineGeneratorApi,
  RewriteMode,
  DialogueStyle,
  IdeaMode,
  ActionItem,
} from "@/lib/noteAiApi";

export function useAdvancedNoteAI() {
  const [loading, setLoading] = useState<string | null>(null);

  const withLoading = useCallback(async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
    setLoading(key);
    try {
      return await fn();
    } finally {
      setLoading(null);
    }
  }, []);

  const rewriteNote = useCallback(
    (text: string, mode: RewriteMode) =>
      withLoading("rewrite", async () => {
        const res = await rewriteNoteApi(text, mode);
        return res.rewritten;
      }),
    [withLoading]
  );

  const expandThought = useCallback(
    (text: string) =>
      withLoading("expand", async () => {
        const res = await expandThoughtApi(text);
        return res.expanded;
      }),
    [withLoading]
  );

  const buildScene = useCallback(
    (location: string, mood: string) =>
      withLoading("scene", async () => {
        const res = await sceneBuilderApi(location, mood);
        return res.scene;
      }),
    [withLoading]
  );

  const buildCharacter = useCallback(
    (description: string) =>
      withLoading("character", async () => {
        const res = await characterBuilderApi(description);
        return res.character;
      }),
    [withLoading]
  );

  const enhanceDialogue = useCallback(
    (text: string, style: DialogueStyle) =>
      withLoading("dialogue", async () => {
        const res = await dialogueEnhancerApi(text, style);
        return res.enhanced;
      }),
    [withLoading]
  );

  const generateIdeas = useCallback(
    (mode: IdeaMode, topic?: string) =>
      withLoading("ideas", async () => {
        const res = await ideaGeneratorApi(mode, topic);
        const raw = res.ideas;
        // Convert string response to array if needed
        if (typeof raw === "string") {
          return raw.split(/\n(?=\d+\.)/).map(s => s.trim()).filter(Boolean);
        }
        return Array.isArray(raw) ? raw : [];
      }),
    [withLoading]
  );

  const structureDocument = useCallback(
    (text: string) =>
      withLoading("structure", async () => {
        const res = await structureDocumentApi(text);
        return res.structured;
      }),
    [withLoading]
  );

  const extractBullets = useCallback(
    (text: string) =>
      withLoading("bullets", async () => {
        const res = await bulletExtractorApi(text);
        return res.bullets;
      }),
    [withLoading]
  );

  const extractActions = useCallback(
    (text: string): Promise<ActionItem[]> =>
      withLoading("actions", async () => {
        const res = await actionItemsApi(text);
        return res.actions;
      }),
    [withLoading]
  );

  const improveAcademic = useCallback(
    (text: string) =>
      withLoading("academic", async () => {
        const res = await academicImproveApi(text);
        return res.improved;
      }),
    [withLoading]
  );

  const strengthenArgument = useCallback(
    (text: string) =>
      withLoading("strengthen", async () => {
        const res = await argumentStrengthenerApi(text);
        return res.strengthened;
      }),
    [withLoading]
  );

  const compareTexts = useCallback(
    (textA: string, textB: string): Promise<string> =>
      withLoading("compare", async () => {
        return await compareTextsApi(textA, textB);
      }),
    [withLoading]
  );

  const generateTitle = useCallback(
    (text: string) =>
      withLoading("title", async () => {
        const res = await autoTitleApi(text);
        return res.title;
      }),
    [withLoading]
  );

  const generateTags = useCallback(
    (text: string) =>
      withLoading("tags", async () => {
        const res = await autoTagsApi(text);
        return res.tags;
      }),
    [withLoading]
  );

  const generateOutline = useCallback(
    (text: string) =>
      withLoading("outline", async () => {
        const res = await outlineGeneratorApi(text);
        return res.outline;
      }),
    [withLoading]
  );

  return {
    loading,
    rewriteNote,
    expandThought,
    buildScene,
    buildCharacter,
    enhanceDialogue,
    generateIdeas,
    structureDocument,
    extractBullets,
    extractActions,
    improveAcademic,
    strengthenArgument,
    compareTexts,
    generateTitle,
    generateTags,
    generateOutline,
  };
}
