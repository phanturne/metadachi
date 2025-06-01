"use client"

import { ChatPanel } from "@/components/chat-panel"
import { SourceDetail } from "@/components/source-detail"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/utils/supabase/client"
import { ArrowLeft, Lock, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import { toast } from "sonner"

interface Notebook {
  id: string
  title: string
  description: string | null
  visibility: "PRIVATE" | "PUBLIC" | "SHARED"
  created_at: string
  updated_at: string
  user_id: string
}

interface Source {
  id: string
  type: "TEXT" | "URL" | "FILE"
  content: string | null
  url: string | null
  file_name: string | null
  file_path?: string | null
  created_at: string
  title: string
  summary?: {
    id: string
    summary_text: string
    key_points: string[]
    quotes: string[]
    tags: string[]
  } | null
}

export default function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, createAnonymousAccount } = useAuth()
  const router = useRouter()
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [notebookSources, setNotebookSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddSourceDialogOpen, setIsAddSourceDialogOpen] = useState(false)
  const [availableSources, setAvailableSources] = useState<Source[]>([])
  const [sourcesToAdd, setSourcesToAdd] = useState<string[]>([])
  const [hasAccess, setHasAccess] = useState(false)
  const [selectedSource, setSelectedSource] = useState<Source | null>(null)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [summary, setSummary] = useState("")

  useEffect(() => {
    const loadNotebook = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("notebooks")
          .select("*")
          .eq("id", id)
          .single()

        if (error) {
          console.error("Error loading notebook:", error)
          toast.error("Failed to load notebook")
          setNotebook(null)
          setHasAccess(false)
          return
        }

        // Check if user has access to the notebook
        const canAccess = data.visibility === "PUBLIC" || 
          (!!user && (data.user_id === user.id || data.visibility === "SHARED"))

        setHasAccess(canAccess)
        setNotebook(data)
      } catch (error) {
        console.error("Error loading notebook:", error)
        toast.error("Failed to load notebook")
        setNotebook(null)
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    const loadNotebookSources = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("notebook_sources")
          .select(`
            source_id,
            sources (
              id,
              type,
              content,
              url,
              file_name,
              file_path,
              created_at,
              title,
              summary:summaries(*)
            )
          `)
          .eq("notebook_id", id)
          .order("order_index")

        if (error) throw error
        setNotebookSources(data?.map(item => ({
          ...item.sources,
          summary: item.sources.summary?.[0] || null
        })) || [])
      } catch (error) {
        console.error("Error loading notebook sources:", error)
        toast.error("Failed to load notebook sources")
      }
    }

    loadNotebook()
    if (hasAccess) {
      loadNotebookSources()
    }
  }, [id, user, hasAccess, router])

  const loadAvailableSources = async () => {
    try {
      const supabase = createClient()
      let query = supabase
        .from("sources")
        .select("id, type, content, url, file_name, file_path, created_at, title")
        .order("created_at", { ascending: false })

      // Only add the NOT IN clause if there are existing sources
      if (notebookSources.length > 0) {
        query = query.not("id", "in", `(${notebookSources.map(s => s.id).join(",")})`)
      }

      const { data, error } = await query

      if (error) throw error
      setAvailableSources(data || [])
    } catch (error) {
      console.error("Error loading available sources:", error)
      toast.error("Failed to load available sources")
    }
  }

  const handleAddSources = async () => {
    try {
      // Create anonymous account if user is not logged in
      if (!user) {
        await createAnonymousAccount()
      }

      const supabase = createClient()
      
      // Get the current max order_index
      const { data: maxOrder } = await supabase
        .from("notebook_sources")
        .select("order_index")
        .eq("notebook_id", id)
        .order("order_index", { ascending: false })
        .limit(1)
        .single()

      const startOrderIndex = (maxOrder?.order_index || 0) + 1

      // Insert all selected sources
      const { error } = await supabase
        .from("notebook_sources")
        .insert(
          sourcesToAdd.map((sourceId, index) => ({
            notebook_id: id,
            source_id: sourceId,
            order_index: startOrderIndex + index,
            added_by: user?.id
          }))
        )

      if (error) throw error

      // Reload notebook sources
      const { data, error: reloadError } = await supabase
        .from("notebook_sources")
        .select(`
          source_id,
          sources (
            id,
            type,
            content,
            url,
            file_name,
            file_path,
            created_at,
            title,
            summary:summaries(*)
          )
        `)
        .eq("notebook_id", id)
        .order("order_index")

      if (reloadError) throw reloadError
      setNotebookSources(data?.map(item => ({
        ...item.sources,
        summary: item.sources.summary?.[0] || null
      })) || [])
      
      setSourcesToAdd([])
      setIsAddSourceDialogOpen(false)
      toast.success("Sources added to notebook")
    } catch (error) {
      console.error("Error adding sources:", error)
      toast.error("Failed to add sources")
    }
  }

  const fetchFileContent = async (filePath: string) => {
    try {
      setIsGeneratingSummary(true)
      const supabase = createClient()
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto py-12 px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="h-[600px] bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!notebook || !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/notebooks")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Access Restricted
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {!notebook 
                ? "This notebook does not exist or you don't have permission to view it."
                : notebook.visibility === "PRIVATE" 
                  ? "This notebook is private and can only be accessed by its owner."
                  : "You don't have permission to view this notebook."}
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => router.push("/notebooks")}>
                Back to Notebooks
              </Button>
              {!user && (
                <Button variant="outline" onClick={() => router.push("/auth/signin")}>
                  Sign in to Access
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-var(--navbar-height))] overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="h-full py-4 px-4 md:px-6 flex flex-col">
        <div className="flex items-center gap-2 mb-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/notebooks")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {notebook.title}
            </h1>
            {notebook.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {notebook.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 flex-1 min-h-0">
          {/* Left panel - Source selection */}
          <div className={`bg-card rounded-lg border shadow-sm p-3 flex flex-col min-h-0 transition-[width,grid-column] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${selectedSource ? 'col-span-6' : 'col-span-4'}`}>
            {selectedSource ? (
              <>
                <div className="flex items-center gap-2 mb-3 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSource(null)}
                    className="h-7 w-7"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-base font-semibold">Source Details</h2>
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <SourceDetail
                    source={selectedSource}
                    onLoadFileContent={fetchFileContent}
                    isGeneratingSummary={isGeneratingSummary}
                    summary={summary}
                  />
                </ScrollArea>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3 flex-shrink-0">
                  <h2 className="text-base font-semibold">Sources</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadAvailableSources()
                      setIsAddSourceDialogOpen(true)
                    }}
                    className="h-7 md:w-auto w-7"
                  >
                    <Plus className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Add Source</span>
                  </Button>
                </div>
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-1.5">
                    {notebookSources.map((source) => (
                      <div
                        key={source.id}
                        className="flex items-start space-x-3 p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedSource(source)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {source.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {source.type.toLowerCase()} • {new Date(source.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {notebookSources.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground">
                        No sources added yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>

          {/* Right panel - Chat interface */}
          <div className={`bg-card rounded-lg border shadow-sm p-3 flex flex-col min-h-0 transition-[width,grid-column] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${selectedSource ? 'col-span-6' : 'col-span-8'}`}>
            <ChatPanel selectedSources={notebookSources.map(s => s.id)} />
          </div>
        </div>
      </div>

      {/* Add Source Dialog */}
      <Dialog open={isAddSourceDialogOpen} onOpenChange={setIsAddSourceDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogTitle>Add Sources to Notebook</DialogTitle>
          <DialogDescription>
            Select sources to add to your notebook
          </DialogDescription>
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <div className="space-y-2">
              {availableSources.map((source) => (
                <div
                  key={source.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${
                    sourcesToAdd.includes(source.id) ? "border-primary" : ""
                  }`}
                  onClick={() => {
                    setSourcesToAdd(prev =>
                      prev.includes(source.id)
                        ? prev.filter(id => id !== source.id)
                        : [...prev, source.id]
                    )
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {source.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {source.type.toLowerCase()} • {new Date(source.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {availableSources.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No available sources to add
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSourcesToAdd([])
                setIsAddSourceDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSources}
              disabled={sourcesToAdd.length === 0}
            >
              Add Selected Sources
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 