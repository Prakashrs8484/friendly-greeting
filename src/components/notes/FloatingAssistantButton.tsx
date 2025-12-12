// src/components/notes/FloatingAssistantButton.tsx
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface FloatingAssistantButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

interface Position {
  x: number;
  y: number;
}

const STORAGE_KEY = "neura-assistant-position";

export function FloatingAssistantButton({ onClick, hasUnread }: FloatingAssistantButtonProps) {
  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { x: window.innerWidth - 80, y: window.innerHeight - 100 };
      }
    }
    return { x: window.innerWidth - 80, y: window.innerHeight - 100 };
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasMoved = useRef(false);

  // Save position to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
  }, [position]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60),
      }));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
    hasMoved.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!buttonRef.current) return;
    const touch = e.touches[0];
    const rect = buttonRef.current.getBoundingClientRect();
    setDragOffset({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsDragging(true);
    hasMoved.current = false;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      hasMoved.current = true;
      const newX = Math.max(0, Math.min(window.innerWidth - 56, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 56, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      hasMoved.current = true;
      const touch = e.touches[0];
      const newX = Math.max(0, Math.min(window.innerWidth - 56, touch.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 56, touch.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleEnd);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleEnd);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, dragOffset]);

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
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      className={cn(
        "fixed z-50",
        "w-14 h-14 rounded-full",
        "bg-primary text-primary-foreground",
        "shadow-lg shadow-primary/25",
        "flex items-center justify-center",
        "transition-shadow duration-300 ease-out",
        "hover:shadow-xl hover:shadow-primary/30",
        "active:scale-95",
        isDragging ? "cursor-grabbing scale-110" : "cursor-grab",
        !isDragging && "animate-float"
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
