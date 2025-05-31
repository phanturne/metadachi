"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Book, FileText, Globe, Loader2, Upload } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { FileUpload } from "./file-upload"

export type SourceType = "TEXT" | "URL" | "FILE"

export type SourceInput = {
  type: SourceType
  content: string
  url: string
  file: File | null
}

interface SourceInputProps {
  onSourceSubmit: (source: SourceInput) => Promise<void>
  isSubmitting?: boolean
  className?: string
}

export function SourceInput({ 
  onSourceSubmit, 
  isSubmitting = false,
  className = "",
}: SourceInputProps) {
  const [inputType, setInputType] = useState<"text" | "url" | "file">("text")
  const [currentSource, setCurrentSource] = useState<SourceInput>({
    type: "TEXT",
    content: "",
    url: "",
    file: null,
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isSubmitting) return

    if (inputType === "file" && !currentSource.file) {
      toast.error("Please select a file to upload")
      return
    }
    if (inputType !== "file" && !currentSource.content && !currentSource.url) {
      toast.error("Please enter some content")
      return
    }

    await onSourceSubmit({
      ...currentSource,
      type: inputType.toUpperCase() as SourceType
    })

    setCurrentSource({
      type: "TEXT",
      content: "",
      url: "",
      file: null,
    })
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs 
          defaultValue="text" 
          className="w-full"
          onValueChange={(value) => {
            setInputType(value as "text" | "url" | "file")
            setCurrentSource(prev => ({ ...prev, type: value.toUpperCase() as SourceType }))
          }}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="text" className="gap-2">
              <FileText className="w-4 h-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Globe className="w-4 h-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="file" className="gap-2">
              <Book className="w-4 h-4" />
              File
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-content" className="text-sm font-medium">Content</Label>
                <Textarea
                  id="text-content"
                  placeholder="Enter your text content..."
                  className="min-h-[100px] resize-none"
                  value={currentSource.content}
                  onChange={(e) => setCurrentSource(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
            </TabsContent>
            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-sm font-medium">URL</Label>
                <Input
                  id="url"
                  placeholder="https://example.com"
                  type="url"
                  value={currentSource.url}
                  onChange={(e) => setCurrentSource(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
            </TabsContent>
            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file" className="text-sm font-medium">File</Label>
                <FileUpload
                  selectedFile={currentSource.file}
                  onFileSelect={(file) => setCurrentSource(prev => ({ ...prev, file }))}
                  disabled={isSubmitting}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <Button
          type="submit"
          className="w-full gap-2"
          disabled={isSubmitting || (inputType === "file" ? !currentSource.file : !currentSource.content && !currentSource.url)}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Source
            </>
          )}
        </Button>
      </form>
    </div>
  )
} 