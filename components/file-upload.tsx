import { Button } from "@/components/ui/button"
import { useRef } from "react"
import { toast } from "sonner"

export const ALLOWED_FILE_TYPES = [
  'text/plain',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/html',
] as const

export type AllowedFileType = typeof ALLOWED_FILE_TYPES[number]

export type FileUploadProps = {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  disabled?: boolean
}

export function FileUpload({ onFileSelect, selectedFile, disabled = false }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_FILE_TYPES.includes(file.type as AllowedFileType)) {
      toast.error("Unsupported file type. Please upload a text file, PDF, or Word document.")
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size too large. Please upload a file smaller than 10MB.")
      return
    }

    onFileSelect(file)
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={ALLOWED_FILE_TYPES.join(",")}
        className="hidden"
        disabled={disabled}
      />
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
          disabled={disabled}
        >
          Choose File
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onFileSelect(null)
            if (fileInputRef.current) {
              fileInputRef.current.value = ""
            }
          }}
          disabled={disabled || !selectedFile}
        >
          Clear
        </Button>
      </div>
      {selectedFile && (
        <div className="text-sm text-muted-foreground">
          Selected file: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
        </div>
      )}
    </div>
  )
} 