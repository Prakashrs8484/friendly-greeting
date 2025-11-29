import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X, Loader2 } from "lucide-react";

interface NotesSearchBarProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  searching: boolean;
  hasResults: boolean;
}

export function NotesSearchBar({ onSearch, onClear, searching, hasResults }: NotesSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search notes (semantic)..."
          className="pl-9 pr-8"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button onClick={handleSearch} disabled={searching || !query.trim()} size="sm">
        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
      </Button>
      {hasResults && (
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Clear Results
        </Button>
      )}
    </div>
  );
}
