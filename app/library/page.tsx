"use client"

import { SourceDetail } from "@/components/source-detail"
import { SourceInput as SourceInputType } from "@/components/source-input"
import { SourceModal } from "@/components/source-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/utils/supabase/client"
import { Book, FileText, Globe, Grid, List, Loader2, Plus, Search, Sparkles, Tag, Trash2, X } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

type SourceType = "TEXT" | "URL" | "FILE"

interface Source {
  id: string
  type: SourceType
  content: string | null
  url: string | null
  file_name: string | null
  file_path: string | null
  file_size: number | null
  file_type: string | null
  created_at: string
  user_id: string
  title: string
  visibility: "PRIVATE" | "PUBLIC" | "SHARED"
  summary?: {
    id: string
    summary_text: string
    key_points: string[]
    quotes: string[]
    tags: string[]
  } | null
}

export default function LibraryPage() {
  const { user } = useAuth()
  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<SourceType | "ALL">("ALL")
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest")
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagSearchQuery, setTagSearchQuery] = useState("")
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [sourceToDelete, setSourceToDelete] = useState<Source | null>(null)
  const [summary, setSummary] = useState("")
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const supabase = createClient()

  const loadSources = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("sources")
        .select(`
          *,
          summary:summaries(*)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const transformedData = (data || []).map(source => ({
        ...source,
        summary: source.summary?.[0] || null
      }))

      setSources(transformedData)
    } catch (error) {
      console.error("Error loading sources:", error)
      toast.error("Failed to load sources")
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadSources()
  }, [loadSources])

  const handleDeleteSource = async () => {
    if (!sourceToDelete) return

    try {
      // If it's a file, delete from storage first
      if (sourceToDelete.type === "FILE" && sourceToDelete.file_path) {
        const { error: storageError } = await supabase.storage
          .from("source_files")
          .remove([sourceToDelete.file_path])

        if (storageError) throw storageError
      }

      // Delete from database
      const { error } = await supabase
        .from("sources")
        .delete()
        .eq("id", sourceToDelete.id)

      if (error) throw error

      toast.success("Source deleted successfully")
      setIsDeleteDialogOpen(false)
      setSourceToDelete(null)
      loadSources()
    } catch (error) {
      console.error("Error deleting source:", error)
      toast.error("Failed to delete source")
    }
  }

  // Get all unique tags from all sources
  const allTags = Array.from(
    new Set(
      sources
        .flatMap(source => source.summary?.tags || [])
        .filter(Boolean)
    )
  ).sort()

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  // Filter tags based on search query
  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  )

  const filteredAndSortedSources = sources
    .filter(source => {
      const matchesSearch = searchQuery === "" || 
        source.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.url?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.file_name?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = selectedType === "ALL" || source.type === selectedType

      const matchesTags = selectedTags.length === 0 || 
        selectedTags.some(tag => source.summary?.tags?.includes(tag))

      return matchesSearch && matchesType && matchesTags
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        default:
          return 0
      }
    })

  const getSourceIcon = (type: Source["type"]) => {
    switch (type) {
      case "TEXT":
        return <FileText className="w-4 h-4" />
      case "URL":
        return <Globe className="w-4 h-4" />
      case "FILE":
        return <Book className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const fetchFileContent = async (filePath: string) => {
    try {
      setIsGeneratingSummary(true)
      const { data, error } = await supabase.storage
        .from('source_files')
        .download(filePath)

      if (error) throw error
      const content = await data.text()
      setSummary(content)
    } catch (error) {
      console.error("Error fetching file content:", error)
      toast.error("Failed to load file content")
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleSourceSubmit = async (source: SourceInputType) => {
    try {
      setIsSubmitting(true)

      const formData = new FormData()
      formData.append("type", source.type)
      
      if (source.type === "TEXT") {
        formData.append("content", source.content)
      } else if (source.type === "URL") {
        formData.append("url", source.url)
      } else if (source.type === "FILE" && source.file) {
        formData.append("file", source.file)
      }

      const response = await fetch("/api/sources", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to add source")
      }

      const data = await response.json()
      
      // If this is a guest account, show the appropriate message
      if (data.isGuest && !user) {
        toast.info("We've created a temporary guest account to save your sources. Add an email to keep them forever!", {
          duration: 5000,
        })
      }

      toast.success("Source added successfully")
      setIsSourceModalOpen(false)
      loadSources()
    } catch (error) {
      console.error("Error adding source:", error)
      toast.error(error instanceof Error ? error.message : "Failed to add source")
    } finally {
      setIsSubmitting(false)
    }
  }

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
            tags: updates.summary.tags
          })
          .eq('id', selectedSource.summary.id);

        if (summaryError) throw summaryError;
      }

      // Reload sources to get updated data
      await loadSources();
      
      // Update selected source with new data
      setSelectedSource(prev => prev ? {
        ...prev,
        title: updates.title,
        summary: prev.summary ? {
          ...prev.summary,
          summary_text: updates.summary?.summary_text || prev.summary.summary_text,
          key_points: updates.summary?.key_points || prev.summary.key_points,
          quotes: updates.summary?.quotes || prev.summary.quotes,
          tags: updates.summary?.tags || prev.summary.tags
        } : null
      } : null);

    } catch (error) {
      console.error("Error updating source:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto max-w-6xl py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Your Library
          </h1>
          <p className="text-muted-foreground/60">
            View and manage your sources and summaries
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Filters and Sort */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    placeholder="Search sources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      <FileText className="h-4 w-4" />
                      {selectedType === "ALL" ? "All Types" : selectedType}
                      {selectedType !== "ALL" && (
                        <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          1
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={selectedType === "ALL"}
                      onCheckedChange={() => setSelectedType("ALL")}
                    >
                      All Types
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedType === "TEXT"}
                      onCheckedChange={() => setSelectedType("TEXT")}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Text
                      </div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedType === "URL"}
                      onCheckedChange={() => setSelectedType("URL")}
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        URL
                      </div>
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedType === "FILE"}
                      onCheckedChange={() => setSelectedType("FILE")}
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
                        <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
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
                        onChange={(e) => setTagSearchQuery(e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="max-h-[200px] overflow-y-auto">
                      {filteredTags.map(tag => (
                        <DropdownMenuCheckboxItem
                          key={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => toggleTag(tag)}
                        >
                          {tag}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-9 gap-2">
                      {sortBy === "newest" ? "Newest First" : "Oldest First"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={sortBy === "newest"}
                      onCheckedChange={() => setSortBy("newest")}
                    >
                      Newest First
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={sortBy === "oldest"}
                      onCheckedChange={() => setSortBy("oldest")}
                    >
                      Oldest First
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    onClick={() => setViewMode("grid")}
                    size="icon"
                    className="h-9 w-9"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    onClick={() => setViewMode("list")}
                    size="icon"
                    className="h-9 w-9"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setIsSourceModalOpen(true)
                  }}
                  className="h-9 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Source
                </Button>
              </div>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(tag => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      {tag}
                      <button
                        onClick={() => toggleTag(tag)}
                        className="rounded-full p-0.5 hover:bg-primary/20"
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
                  className="h-8 text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Sources List */}
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAndSortedSources.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No sources found
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
              {filteredAndSortedSources.map((source) => (
                <div
                  key={source.id}
                  className={`bg-card rounded-xl shadow-lg p-6 border border-border/50 hover:border-primary/50 transition-all duration-200 ${
                    viewMode === "list" ? "flex items-start gap-4" : ""
                  }`}
                >
                  <div 
                    className={`${viewMode === "list" ? "flex items-start gap-4 flex-1" : ""} cursor-pointer group relative`}
                    onClick={() => setSelectedSource(source)}
                  >
                    {viewMode === "list" ? (
                      <div className="flex flex-col gap-2 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                              {getSourceIcon(source.type)}
                            </div>
                            <span className="text-sm text-muted-foreground">{formatDate(source.created_at)}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSourceToDelete(source);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors">
                          {source.title}
                        </div>
                        {source.summary && (
                          <div className="mt-2">
                            <div className="flex items-center gap-2 text-primary mb-1">
                              <Sparkles className="w-4 h-4" />
                              <span className="font-medium text-sm">Summary</span>
                            </div>
                            <div className="text-muted-foreground line-clamp-2 text-sm">
                              {source.summary.summary_text}
                            </div>
                            {source.summary.tags && source.summary.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {source.summary.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {getSourceIcon(source.type)}
                            <span className="text-sm text-muted-foreground">{formatDate(source.created_at)}</span>
                          </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSourceToDelete(source);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-medium mb-3 line-clamp-1 group-hover:text-primary transition-colors">
                            {source.title}
                          </div>
                          {source.summary && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                              <div className="flex items-center gap-2 text-primary mb-2">
                                <Sparkles className="w-4 h-4" />
                                <span className="font-medium text-sm">Summary</span>
                              </div>
                              <div className="text-muted-foreground line-clamp-3 text-sm">
                                {source.summary.summary_text}
                              </div>
                              {source.summary.tags && source.summary.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                  {source.summary.tags.map((tag, index) => (
                                    <span
                                      key={index}
                                      className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
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
      <Dialog open={!!selectedSource} onOpenChange={() => {
        setSelectedSource(null)
        setSummary("")
      }}>
        <DialogContent className="sm:max-w-6xl max-h-[80vh] overflow-y-auto">
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
  )
} 