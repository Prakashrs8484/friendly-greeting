// src/components/notes/AIToolsMenu.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  PenTool,
  Briefcase,
  Expand,
  MapPin,
  User,
  MessageSquare,
  Lightbulb,
  ListTree,
  List,
  CheckSquare,
  GraduationCap,
  Shield,
  GitCompare,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { RewriteMode, DialogueStyle, IdeaMode } from "@/lib/noteAiApi";

// Modal imports
import { SceneBuilderModal } from "./modals/SceneBuilderModal";
import { CharacterBuilderModal } from "./modals/CharacterBuilderModal";
import { IdeaGeneratorModal } from "./modals/IdeaGeneratorModal";
import { CompareTextsModal } from "./modals/CompareTextsModal";

interface AIToolsMenuProps {
  noteContent: string;
  onContentChange: (content: string) => void;
  onRewrite: (mode: RewriteMode) => Promise<void>;
  onExpand: () => Promise<void>;
  onBuildScene: (location: string, mood: string) => Promise<string>;
  onBuildCharacter: (description: string) => Promise<object>;
  onEnhanceDialogue: (style: DialogueStyle) => Promise<void>;
  onGenerateIdeas: (mode: IdeaMode, topic?: string) => Promise<string[]>;
  onStructure: () => Promise<void>;
  onExtractBullets: () => Promise<void>;
  onExtractActions: () => Promise<void>;
  onImproveAcademic: () => Promise<void>;
  onStrengthen: () => Promise<void>;
  onCompare: (textA: string, textB: string) => Promise<void>;
  loading: string | null;
  disabled?: boolean;
}

const REWRITE_MODES: { value: RewriteMode; label: string }[] = [
  { value: "poetic", label: "Poetic" },
  { value: "cinematic", label: "Cinematic" },
  { value: "professional", label: "Professional" },
  { value: "humorous", label: "Humorous" },
  { value: "emotional", label: "Emotional" },
  { value: "minimalist", label: "Minimalist" },
  { value: "dramatic", label: "Dramatic" },
  { value: "shakespearean", label: "Shakespearean" },
  { value: "simple", label: "Simple" },
  { value: "expanded", label: "Expanded" },
];

const DIALOGUE_STYLES: { value: DialogueStyle; label: string }[] = [
  { value: "natural", label: "Natural" },
  { value: "emotional", label: "Emotional" },
  { value: "romantic", label: "Romantic" },
  { value: "dramatic", label: "Dramatic" },
  { value: "comedic", label: "Comedic" },
  { value: "formal", label: "Formal" },
  { value: "aggressive", label: "Aggressive" },
  { value: "mysterious", label: "Mysterious" },
];

export function AIToolsMenu({
  noteContent,
  onContentChange,
  onRewrite,
  onExpand,
  onBuildScene,
  onBuildCharacter,
  onEnhanceDialogue,
  onGenerateIdeas,
  onStructure,
  onExtractBullets,
  onExtractActions,
  onImproveAcademic,
  onStrengthen,
  onCompare,
  loading,
  disabled = false,
}: AIToolsMenuProps) {
  const [sceneModalOpen, setSceneModalOpen] = useState(false);
  const [characterModalOpen, setCharacterModalOpen] = useState(false);
  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const isLoading = loading !== null;

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Writer Tools Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || isLoading}
              className="text-xs gap-1.5"
            >
              {loading?.startsWith("rewrite") || loading === "expand" || loading === "scene" || 
               loading === "character" || loading === "dialogue" || loading === "ideas" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <PenTool className="h-3.5 w-3.5" />
              )}
              Writer Tools
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-background border z-50">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Creative Writing
            </DropdownMenuLabel>
            
            {/* Creative Rewrite Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                Creative Rewrite
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-background border z-50">
                {REWRITE_MODES.map((mode) => (
                  <DropdownMenuItem
                    key={mode.value}
                    onClick={() => onRewrite(mode.value)}
                    className="text-xs"
                    disabled={!noteContent.trim()}
                  >
                    {mode.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              onClick={onExpand}
              disabled={!noteContent.trim()}
              className="text-xs"
            >
              <Expand className="h-3.5 w-3.5 mr-2" />
              Expand Thought
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setSceneModalOpen(true)}
              className="text-xs"
            >
              <MapPin className="h-3.5 w-3.5 mr-2" />
              Scene Builder
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setCharacterModalOpen(true)}
              className="text-xs"
            >
              <User className="h-3.5 w-3.5 mr-2" />
              Character Builder
            </DropdownMenuItem>

            {/* Dialogue Enhancer Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">
                <MessageSquare className="h-3.5 w-3.5 mr-2" />
                Dialogue Enhancer
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="bg-background border z-50">
                {DIALOGUE_STYLES.map((style) => (
                  <DropdownMenuItem
                    key={style.value}
                    onClick={() => onEnhanceDialogue(style.value)}
                    className="text-xs"
                    disabled={!noteContent.trim()}
                  >
                    {style.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuItem
              onClick={() => setIdeaModalOpen(true)}
              className="text-xs"
            >
              <Lightbulb className="h-3.5 w-3.5 mr-2" />
              Idea Generator
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Productivity Tools Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || isLoading}
              className="text-xs gap-1.5"
            >
              {loading === "structure" || loading === "bullets" || loading === "actions" ||
               loading === "academic" || loading === "strengthen" || loading === "compare" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Briefcase className="h-3.5 w-3.5" />
              )}
              Productivity Tools
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-background border z-50">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Document Processing
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={onStructure}
              disabled={!noteContent.trim()}
              className="text-xs"
            >
              <ListTree className="h-3.5 w-3.5 mr-2" />
              Structure Document
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onExtractBullets}
              disabled={!noteContent.trim()}
              className="text-xs"
            >
              <List className="h-3.5 w-3.5 mr-2" />
              Extract Bullet Points
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onExtractActions}
              disabled={!noteContent.trim()}
              className="text-xs"
            >
              <CheckSquare className="h-3.5 w-3.5 mr-2" />
              Extract Action Items
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Academic & Research
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={onImproveAcademic}
              disabled={!noteContent.trim()}
              className="text-xs"
            >
              <GraduationCap className="h-3.5 w-3.5 mr-2" />
              Academic Improve
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={onStrengthen}
              disabled={!noteContent.trim()}
              className="text-xs"
            >
              <Shield className="h-3.5 w-3.5 mr-2" />
              Strengthen Argument
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => setCompareModalOpen(true)}
              className="text-xs"
            >
              <GitCompare className="h-3.5 w-3.5 mr-2" />
              Compare Two Texts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modals */}
      <SceneBuilderModal
        open={sceneModalOpen}
        onClose={() => setSceneModalOpen(false)}
        onGenerate={onBuildScene}
        onInsert={(text) => onContentChange(noteContent + "\n\n" + text)}
        onReplace={onContentChange}
        loading={loading === "scene"}
      />

      <CharacterBuilderModal
        open={characterModalOpen}
        onClose={() => setCharacterModalOpen(false)}
        onGenerate={onBuildCharacter}
        onInsert={(text) => onContentChange(noteContent + "\n\n" + text)}
        onReplace={onContentChange}
        loading={loading === "character"}
      />

      <IdeaGeneratorModal
        open={ideaModalOpen}
        onClose={() => setIdeaModalOpen(false)}
        onGenerate={onGenerateIdeas}
        onInsert={(text) => onContentChange(noteContent + "\n\n" + text)}
        onReplace={onContentChange}
        loading={loading === "ideas"}
      />

      <CompareTextsModal
        open={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onCompare={onCompare}
        noteContent={noteContent}
        loading={loading === "compare"}
      />
    </>
  );
}
