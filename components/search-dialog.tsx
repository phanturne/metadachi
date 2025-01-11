'use client';

import * as React from 'react';
import { ArrowUpDown, FileText, MessageSquare } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
  { label: 'All', value: 'all', icon: ArrowUpDown },
  { label: 'Notes', value: 'notes', icon: FileText },
  { label: 'AI Chats', value: 'ai-chats', icon: MessageSquare },
];

interface SearchDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function SearchDialog({ open, setOpen }: SearchDialogProps) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortDirection, setSortDirection] = React.useState('asc');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={handleClose}
      className="max-h-[600px] max-w-[800px]"
    >
      <CommandInput
        placeholder="Search notes and chats..."
        className="h-14 text-base placeholder:text-muted-foreground/70"
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <div className="border-b border-border/80 px-3 py-2">
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="outline"
            className="cursor-pointer text-sm transition-all hover:scale-105"
            onClick={() =>
              setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
            }
          >
            <ArrowUpDown className="mr-2 size-4" />
            {sortDirection === 'asc' ? 'Sort A-Z' : 'Sort Z-A'}
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.value}
              variant={
                selectedCategory === category.value ? 'default' : 'secondary'
              }
              className={cn(
                'cursor-pointer text-sm transition-all hover:scale-105',
                selectedCategory === category.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80',
              )}
              onClick={() => setSelectedCategory(category.value)}
            >
              <category.icon className="mr-1 size-3" />
              {category.label}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex h-[450px]">
        <div className="flex-1">
          <ScrollArea className="h-full p-4">
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="h-full">
                <div className="grid grid-cols-2 gap-4">
                  {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        <div key={index} className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      ))
                    : Array.from({ length: 6 }).map((_, index) => (
                        <CommandItem
                          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                          key={index}
                          className="group cursor-pointer rounded-lg border border-border/50 bg-card px-4 py-3 text-left shadow-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground hover:shadow-md"
                        >
                          <div className="flex w-full flex-col space-y-2">
                            <div className="flex items-start justify-between">
                              <span className="text-sm font-medium leading-none">
                                {index % 2 === 0 ? 'Sample Note' : 'AI Chat'}{' '}
                                {index + 1}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {index % 2 === 0
                                ? 'Created 2 days ago'
                                : 'Last message 1 hour ago'}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                </div>
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </div>
      </div>
    </CommandDialog>
  );
}
