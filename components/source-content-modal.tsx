import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Source } from "@/types/chat"

interface SourceContentModalProps {
  source: Source | null
  onOpenChange: (open: boolean) => void
}

export function SourceContentModal({ source, onOpenChange }: SourceContentModalProps) {
  return (
    <Dialog open={!!source} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] min-h-[200px] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">
              {source?.file_name || source?.url || "Text Source"}
            </span>
            <Badge variant="secondary" className="text-xs">
              {source?.type.toLowerCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            <div className="prose dark:prose-invert max-w-none p-1">
              <pre className="whitespace-pre-wrap text-sm">
                {source?.content}
              </pre>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
} 