'use client';

import { Search, Globe, Library } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type SearchMode = 'local' | 'community';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchMode?: SearchMode;
  onModeChange?: (mode: SearchMode) => void;
  showToggle?: boolean;
}

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Search…',
  searchMode = 'local',
  onModeChange,
  showToggle = false
}: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <div className="relative flex items-center flex-1">
        <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={searchMode === 'local' ? placeholder : "Search the community..."}
          className="pl-9 w-full"
        />
      </div>
      
      {showToggle && onModeChange && (
        <div className="flex bg-muted p-1 rounded-lg self-start">
          <button
            type="button"
            onClick={() => onModeChange('local')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              searchMode === 'local' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Library className="w-3.5 h-3.5" />
            Local
          </button>
          <button
            type="button"
            onClick={() => onModeChange('community')}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
              searchMode === 'community' 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            Community
          </button>
        </div>
      )}
    </div>
  );
}
