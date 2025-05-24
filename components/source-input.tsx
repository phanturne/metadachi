"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Book, FileText, Globe, Loader2, Upload } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"

export type SourceType = "TEXT" | "URL" | "FILE"

export type SourceInput = {
  type: SourceType
  content: string
  url: string
  file: File | null
}

const ALLOWED_FILE_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/html',
]

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("Unsupported file type. Please upload a text file, PDF, or Word document.")
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size too large. Please upload a file smaller than 10MB.")
      return
    }

    setCurrentSource(prev => ({ ...prev, file }))
  }

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
                <div className="flex flex-col gap-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept={ALLOWED_FILE_TYPES.join(",")}
                    className="hidden"
                  />
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1"
                    >
                      Choose File
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setCurrentSource(prev => ({ ...prev, file: null }))
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""
                        }
                      }}
                      disabled={!currentSource.file}
                    >
                      Clear
                    </Button>
                  </div>
                  {currentSource.file && (
                    <div className="text-sm text-muted-foreground">
                      Selected file: {currentSource.file.name} ({(currentSource.file.size / 1024 / 1024).toFixed(2)}MB)
                    </div>
                  )}
                </div>
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