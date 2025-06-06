import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Source } from '@/types/chat';

interface SourceContentModalProps {
  source: Source | null;
  onOpenChange: (open: boolean) => void;
}

export function SourceContentModal({ source, onOpenChange }: SourceContentModalProps) {
  return (
    <Dialog open={!!source} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[80vh] min-h-[200px] max-w-3xl flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <span className="truncate">{source?.file_name || source?.url || 'Text Source'}</span>
            <Badge variant="secondary" className="text-xs">
              {source?.type.toLowerCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="prose dark:prose-invert max-w-none p-1">
              <pre className="text-sm whitespace-pre-wrap">{source?.content}</pre>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
