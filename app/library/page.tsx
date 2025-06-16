'use client';

import { SourceDetail } from '@/components/source-detail';
import { SourceInput as SourceInputType } from '@/components/source-input';
import { SourceModal } from '@/components/source-modal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/auth-context';
import { useAnonymousAuth } from '@/hooks/use-anonymous-auth';
import { createClient } from '@/utils/supabase/client';
import {
  Book,
  FileText,
  Globe,
  Grid,
  List,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

type SourceType = 'TEXT' | 'URL' | 'FILE';

interface Source {
  id: string;
  type: SourceType;
  content: string | null;
  url: string | null;
  file_name: string | null;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  user_id: string;
  title: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  summary?: {
    id: string;
    summary_text: string;
    key_points: string[];
    quotes: string[];
    tags: string[];
  } | null;
}

export default function LibraryPage() {
  const { user } = useAuth();
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<SourceType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null);
  const [summary, setSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const supabase = createClient();
  const { ensureAuthenticated } = useAnonymousAuth();

  const loadSources = useCallback(async () => {
    try {
      if (!user?.id) {
        setSources([]);
        return;
      }

      const { data, error } = await supabase
        .from('sources')
        .select(
          `
          *,
          summary:summaries(*)
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedData = (data || []).map(source => ({
        ...source,
        summary: source.summary?.[0] || null,
      }));

      console.log('Loading sources:', transformedData.length);
      setSources(transformedData);
    } catch (error) {
      console.error('Error loading sources:', error);
      toast.error('Failed to load sources');
    } finally {
      setIsLoading(false);
    }
  }, [supabase, user?.id]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  const handleDeleteSource = async () => {
    if (!sourceToDelete) return;

    try {
      // If it's a file, delete from storage first
      if (sourceToDelete.type === 'FILE' && sourceToDelete.file_path) {
        const { error: storageError } = await supabase.storage
          .from('source_files')
          .remove([sourceToDelete.file_path]);

        if (storageError) throw storageError;
      }

      // Delete from database
      const { error } = await supabase.from('sources').delete().eq('id', sourceToDelete.id);

      if (error) throw error;

      toast.success('Source deleted successfully');
      setIsDeleteDialogOpen(false);
      setSourceToDelete(null);
      loadSources();
    } catch (error) {
      console.error('Error deleting source:', error);
      toast.error('Failed to delete source');
    }
  };

  // Get all unique tags from all sources
  const allTags = Array.from(
    new Set(sources.flatMap(source => source.summary?.tags || []).filter(Boolean))
  ).sort();

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  // Filter tags based on search query
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  const filteredAndSortedSources = sources
    .filter(source => {
      const matchesSearch =
        searchQuery === '' ||
        source.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.file_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'ALL' || source.type === selectedType;

      const matchesTags =
        selectedTags.length === 0 || selectedTags.some(tag => source.summary?.tags?.includes(tag));

      return matchesSearch && matchesType && matchesTags;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return 0;
      }
    });

  const getSourceIcon = (type: Source['type']) => {
    switch (type) {
      case 'TEXT':
        return <FileText className="h-4 w-4" />;
      case 'URL':
        return <Globe className="h-4 w-4" />;
      case 'FILE':
        return <Book className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchFileContent = async (filePath: string) => {
    try {
      setIsGeneratingSummary(true);
      const { data, error } = await supabase.storage.from('source_files').download(filePath);

      if (error) throw error;
      const content = await data.text();
      setSummary(content);
    } catch (error) {
      console.error('Error fetching file content:', error);
      toast.error('Failed to load file content');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSourceSubmit = async (source: SourceInputType) => {
    try {
      setIsSubmitting(true);

      // Ensure user is authenticated before proceeding
      await ensureAuthenticated();

      const formData = new FormData();
      formData.append('type', source.type);

      if (source.type === 'TEXT') {
        formData.append('content', source.content);
      } else if (source.type === 'URL') {
        formData.append('url', source.url);
      } else if (source.type === 'FILE' && source.file) {
        formData.append('file', source.file);
      }

      const response = await fetch('/api/sources', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          // Rate limit exceeded
          toast.error(
            <div className="space-y-1">
              <p className="font-medium">Rate Limit Exceeded</p>
              <p className="text-muted-foreground text-sm">{data.message}</p>
              {data.reset && (
                <p className="text-muted-foreground text-sm">
                  Resets in {new Date(data.reset).toLocaleTimeString()}
                </p>
              )}
            </div>,
            {
              duration: 8000, // Show for 8 seconds
            }
          );
        } else {
          toast.error(data.error || 'Failed to add source');
        }
        return;
      }

      // Show transition message if we're using a smaller model
      if (data.rateLimit?.isTransitioningToSmallerModel) {
        toast.info(data.rateLimit.transitionMessage, {
          duration: 5000, // Show for 5 seconds
        });
      }

      toast.success('Source added successfully');
      setIsSourceModalOpen(false);

      // Force a reload of sources after a short delay to ensure the database has updated
      setTimeout(() => {
        loadSources();
      }, 500);
    } catch (error) {
      console.error('Error adding source:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add source');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSource = async (updates: {
    title: string;
    summary?: {
      summary_text: string;
      key_points: string[];
      quotes: string[];
      tags: string[];
    };
  }) => {
    if (!selectedSource) return;

    try {
      // Update source title
      const { error: sourceError } = await supabase
        .from('sources')
        .update({ title: updates.title })
        .eq('id', selectedSource.id);

      if (sourceError) throw sourceError;

      // Update summary if it exists
      if (updates.summary && selectedSource.summary) {
        const { error: summaryError } = await supabase
          .from('summaries')
          .update({
            summary_text: updates.summary.summary_text,
            key_points: updates.summary.key_points,
            quotes: updates.summary.quotes,
            tags: updates.summary.tags,
          })
          .eq('id', selectedSource.summary.id);

        if (summaryError) throw summaryError;
      }

      // Reload sources to get updated data
      await loadSources();

      // Update selected source with new data
      setSelectedSource(prev =>
        prev
          ? {
              ...prev,
              title: updates.title,
              summary: prev.summary
                ? {
                    ...prev.summary,
                    summary_text: updates.summary?.summary_text || prev.summary.summary_text,
                    key_points: updates.summary?.key_points || prev.summary.key_points,
                    quotes: updates.summary?.quotes || prev.summary.quotes,
                    tags: updates.summary?.tags || prev.summary.tags,
                  }
                : null,
            }
          : null
      );
    } catch (error) {
      console.error('Error updating source:', error);
      throw error;
    }
  };

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="from-primary to-primary/60 mb-4 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
            Your Library
          </h1>
          <p className="text-muted-foreground/60">View and manage your sources and summaries</p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Filters and Sort */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="text-muted-foreground h-4 w-4" />
                  </div>
                  <Input
                    placeholder="Search sources..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      <FileText className="h-4 w-4" />
                      {selectedType === 'ALL' ? 'All Types' : selectedType}
                      {selectedType !== 'ALL' && (
                        <span className="bg-primary/10 text-primary ml-1 rounded-full px-2 py-0.5 text-xs">
                          1
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={selectedType === 'ALL'}
                      onCheckedChange={() => setSelectedType('ALL')}
                    >
                      All Types
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedType === 'TEXT'}
                      onCheckedChange={() => setSelectedType('TEXT')}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Text
                      </div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedType === 'URL'}
                      onCheckedChange={() => setSelectedType('URL')}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        URL
                      </div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedType === 'FILE'}
                      onCheckedChange={() => setSelectedType('FILE')}
                    >
                      <div className="flex items-center gap-2">
                        <Book className="h-4 w-4" />
                        File
                      </div>
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                      {selectedTags.length > 0 && (
                        <span className="bg-primary/10 text-primary ml-1 rounded-full px-2 py-0.5 text-xs">
                          {selectedTags.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <Input
                        placeholder="Search tags..."
                        value={tagSearchQuery}
                        onChange={e => setTagSearchQuery(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-x-hidden overflow-y-auto">
                      {filteredTags.map(tag => (
                        <DropdownMenuCheckboxItem
                          key={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                          className="pr-4 pl-2"
                        >
                          <span className="block w-full truncate">{tag}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={sortBy === 'newest'}
                      onCheckedChange={() => setSortBy('newest')}
                    >
                      Newest First
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sortBy === 'oldest'}
                      onCheckedChange={() => setSortBy('oldest')}
                    >
                      Oldest First
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex gap-2">
                  <ButtonGroup>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                      size="icon"
                      className="h-9 w-9 rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                      size="icon"
                      className="h-9 w-9 rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </ButtonGroup>

                  <Button
                    onClick={() => {
                      setIsSourceModalOpen(true);
                    }}
                    className="h-9 gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Source</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <div
                      key={tag}
                      className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags([])}
                  className="text-muted-foreground hover:text-foreground h-8"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Sources List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
          ) : filteredAndSortedSources.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">No sources found</div>
          ) : (
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                viewMode === 'grid'
                  ? 'grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 gap-2'
              }`}
            >
              {filteredAndSortedSources.map(source => (
                <div
                  key={source.id}
                  className={`bg-card border-border/50 hover:border-primary/50 rounded-xl border shadow-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'p-2' : 'p-6'
                  }`}
                >
                  <div
                    className={`${viewMode === 'list' ? 'flex items-center gap-2' : ''} group relative cursor-pointer`}
                    onClick={() => setSelectedSource(source)}
                  >
                    {viewMode === 'list' ? (
                      <>
                        <div className="bg-primary/10 text-primary shrink-0 rounded-md p-1">
                          {getSourceIcon(source.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <div className="group-hover:text-primary truncate text-sm font-medium transition-colors">
                                {source.title}
                              </div>
                              <div className="text-muted-foreground/80 shrink-0 text-xs">
                                {formatDate(source.created_at)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {source.summary?.tags && source.summary.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  {source.summary.tags.slice(0, 2).map((tag, index) => (
                                    <span
                                      key={index}
                                      className="bg-primary/5 text-primary/80 shrink-0 rounded-full px-1.5 py-0.5 text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {source.summary.tags.length > 2 && (
                                    <span className="text-muted-foreground/60 text-xs">
                                      +{source.summary.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={e => {
                                  e.stopPropagation();
                                  setSourceToDelete(source);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-6 w-6 opacity-0 transition-colors group-hover:opacity-100"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-muted-foreground flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSourceIcon(source.type)}
                            <span className="text-muted-foreground text-sm">
                              {formatDate(source.created_at)}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={e => {
                              e.stopPropagation();
                              setSourceToDelete(source);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 h-8 w-8 opacity-0 transition-colors group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="group-hover:text-primary mb-3 line-clamp-1 text-lg font-medium transition-colors">
                            {source.title}
                          </div>
                          {source.summary && (
                            <div className="border-border/50 mt-4 border-t pt-4">
                              <div className="text-primary mb-2 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                <span className="text-sm font-medium">Summary</span>
                              </div>
                              <div className="text-muted-foreground line-clamp-3 text-sm">
                                {source.summary.summary_text}
                              </div>
                              {source.summary.tags && source.summary.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1.5">
                                  {source.summary.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Source Modal */}
      <SourceModal
        open={isSourceModalOpen}
        onOpenChange={setIsSourceModalOpen}
        onSourceSubmit={handleSourceSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this source? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSource}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Source Detail Dialog */}
      <Dialog
        open={!!selectedSource}
        onOpenChange={() => {
          setSelectedSource(null);
          setSummary('');
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-6xl" showClose={false}>
          {selectedSource && (
            <div className="w-full">
              <SourceDetail
                source={selectedSource}
                onLoadFileContent={fetchFileContent}
                isGeneratingSummary={isGeneratingSummary}
                summary={summary}
                onSave={handleSaveSource}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
