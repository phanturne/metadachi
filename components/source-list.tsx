"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/utils/supabase/client"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"

type Source = {
  id: string
  type: "TEXT" | "URL" | "FILE"
  content: string | null
  url: string | null
  file_name: string | null
  created_at: string
}

interface SourceListProps {
  selectedSources: string[]
  onSourceSelect: (sourceId: string) => void
}

export function SourceList({ selectedSources, onSourceSelect }: SourceListProps) {
  const [sources, setSources] = useState<Source[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchSources = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching sources:", error)
        return
      }

      setSources(data || [])
      setIsLoading(false)
    }

    fetchSources()
  }, [])

  const filteredSources = sources.filter(source => {
    const searchLower = searchQuery.toLowerCase()
    return (
      source.content?.toLowerCase().includes(searchLower) ||
      source.url?.toLowerCase().includes(searchLower) ||
      source.file_name?.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Skeleton className="h-9 w-full pl-8" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-2">
          {filteredSources.map((source) => (
            <div
              key={source.id}
              className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <Checkbox
                checked={selectedSources.includes(source.id)}
                onCheckedChange={() => onSourceSelect(source.id)}
                className="mt-1"
              />
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
        </div>
      </ScrollArea>
    </div>
  )
} 