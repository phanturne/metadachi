"use client"

import { NotebookModal } from "@/components/notebook-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/utils/supabase/client"
import { BookOpen, Grid, List, Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Notebook {
  id: string
  title: string
  description: string | null
  visibility: "PRIVATE" | "PUBLIC" | "SHARED"
  created_at: string
  updated_at: string
  user_id: string
  cover_image_url: string | null
  tags: string[] | null
}

export default function NotebooksPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [notebooks, setNotebooks] = useState<Notebook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const loadNotebooks = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("notebooks")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setNotebooks(data || [])
    } catch (error) {
      console.error("Error loading notebooks:", error)
      toast.error("Failed to load notebooks")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user) {
      router.push("/auth/signin")
    } else {
      loadNotebooks()
    }
  }, [user, router])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const filteredNotebooks = notebooks.filter(notebook =>
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notebook.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Notebooks
            </h1>
            <p className="text-muted-foreground">
              Organize and manage your sources in notebooks
            </p>
          </div>
          <Button onClick={() => setIsNotebookModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Notebook
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  placeholder="Search notebooks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
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
          </div>

          {/* Notebooks List */}
          {filteredNotebooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No notebooks found
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-6"}>
              {filteredNotebooks.map((notebook) => (
                <div
                  key={notebook.id}
                  className={`bg-card rounded-xl shadow-lg p-6 border border-border/50 hover:border-primary/50 transition-all duration-200 cursor-pointer ${
                    viewMode === "list" ? "flex items-start gap-4" : ""
                  }`}
                  onClick={() => router.push(`/notebooks/${notebook.id}`)}
                >
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-md text-primary">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="text-sm text-muted-foreground">{formatDate(notebook.created_at)}</span>
                    </div>
                    <div className="text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {notebook.title}
                    </div>
                    {notebook.description && (
                      <div className="text-muted-foreground line-clamp-2 text-sm">
                        {notebook.description}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        notebook.visibility === "PRIVATE" 
                          ? "bg-muted text-muted-foreground"
                          : notebook.visibility === "PUBLIC"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}>
                        {notebook.visibility.charAt(0) + notebook.visibility.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NotebookModal 
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        onNotebookCreated={() => {
          loadNotebooks()
        }}
      />
    </div>
  )
} 