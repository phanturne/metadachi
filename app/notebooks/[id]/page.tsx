"use client"

import { ChatPanel } from "@/components/chat-panel"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/utils/supabase/client"
import { ArrowLeft, Plus } from "lucide-react"
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
  created_at: string
}

export default function NotebookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const [notebook, setNotebook] = useState<Notebook | null>(null)
  const [notebookSources, setNotebookSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddSourceDialogOpen, setIsAddSourceDialogOpen] = useState(false)
  const [availableSources, setAvailableSources] = useState<Source[]>([])
  const [sourcesToAdd, setSourcesToAdd] = useState<string[]>([])

  useEffect(() => {
    const loadNotebook = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from("notebooks")
          .select("*")
          .eq("id", id)
          .single()

        if (error) throw error
        setNotebook(data)
      } catch (error) {
        console.error("Error loading notebook:", error)
        toast.error("Failed to load notebook")
        router.push("/notebooks")
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
              created_at
            )
          `)
          .eq("notebook_id", id)
          .order("order_index")

        if (error) throw error
        setNotebookSources(data?.map(item => item.sources) || [])
      } catch (error) {
        console.error("Error loading notebook sources:", error)
        toast.error("Failed to load notebook sources")
      }
    }

    if (!user && !isLoading) {
      router.push("/auth/signin")
    } else if (user) {
      loadNotebook()
      loadNotebookSources()
    }
  }, [user, isLoading, router, id])

  const loadAvailableSources = async () => {
    try {
      const supabase = createClient()
      let query = supabase
        .from("sources")
        .select("*")
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
            created_at
          )
        `)
        .eq("notebook_id", id)
        .order("order_index")

      if (reloadError) throw reloadError
      setNotebookSources(data?.map(item => item.sources) || [])
      
      setSourcesToAdd([])
      setIsAddSourceDialogOpen(false)
      toast.success("Sources added to notebook")
    } catch (error) {
      console.error("Error adding sources:", error)
      toast.error("Failed to add sources")
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

  if (!notebook) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/notebooks")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              {notebook.title}
            </h1>
            {notebook.description && (
              <p className="text-sm text-muted-foreground line-clamp-1">
                {notebook.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          {/* Left panel - Source selection */}
          <div className="col-span-4 bg-card rounded-lg border shadow-sm p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Sources</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadAvailableSources()
                  setIsAddSourceDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              <div className="space-y-2">
                {notebookSources.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {source.file_name || source.url || "Text Source"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {source.type.toLowerCase()} • {new Date(source.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {notebookSources.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No sources added yet
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right panel - Chat interface */}
          <div className="col-span-8 bg-card rounded-lg border shadow-sm p-4 flex flex-col h-full">
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
                      {source.file_name || source.url || "Text Source"}
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