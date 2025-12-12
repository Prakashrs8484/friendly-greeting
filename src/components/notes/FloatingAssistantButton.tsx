// src/components/notes/FloatingAssistantButton.tsx
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface FloatingAssistantButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

const STORAGE_KEY = "neuraNotes_assistantPosition";
const DEFAULT_POSITION = { x: 24, y: 24 }; // bottom-right offset

export function FloatingAssistantButton({ onClick, hasUnread }: FloatingAssistantButtonProps) {
  const [position, setPosition] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_POSITION;
    } catch {
      return DEFAULT_POSITION;
    }
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasMoved = useRef(false);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    hasMoved.current = false;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    hasMoved.current = false;
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const deltaX = dragRef.current.startX - e.clientX;
      const deltaY = dragRef.current.startY - e.clientY;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMoved.current = true;
      }

      const newX = Math.max(8, Math.min(window.innerWidth - 72, dragRef.current.startPosX + deltaX));
      const newY = Math.max(8, Math.min(window.innerHeight - 72, dragRef.current.startPosY + deltaY));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!dragRef.current) return;
      const touch = e.touches[0];
      const deltaX = dragRef.current.startX - touch.clientX;
      const deltaY = dragRef.current.startY - touch.clientY;

      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMoved.current = true;
      }

      const newX = Math.max(8, Math.min(window.innerWidth - 72, dragRef.current.startPosX + deltaX));
      const newY = Math.max(8, Math.min(window.innerHeight - 72, dragRef.current.startPosY + deltaY));
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging]);

  const handleClick = () => {
    if (!hasMoved.current) {
      onClick();
    }
  };

  return (
    <button
      ref={buttonRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
      }}
      className={cn(
        "fixed z-50",
        "w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg shadow-primary/25",
        "flex items-center justify-center",
        "transition-shadow duration-200",
        "hover:shadow-xl hover:shadow-primary/30",
        "select-none touch-none",
        isDragging ? "cursor-grabbing scale-110" : "cursor-grab animate-float"
      )}
      aria-label="Open AI Assistant"
    >
      <Bot className="w-6 h-6" />
      {hasUnread && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full animate-pulse" />
      )}
    </button>
  );
}
