import { SourceDetail } from '@/components/source-detail';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Source } from '@/types/source';

interface SourceDetailModalProps {
  source: Source | null;
  onClose: () => void;
  onLoadFileContent: (filePath: string) => Promise<void>;
  isGeneratingSummary: boolean;
  summary: string;
  onSave: (updates: {
    title: string;
    summary?: {
      summary_text: string;
      key_points: string[];
      quotes: string[];
      tags: string[];
    };
  }) => Promise<void>;
}

export function SourceDetailModal({
  source,
  onClose,
  onLoadFileContent,
  isGeneratingSummary,
  summary,
  onSave,
}: SourceDetailModalProps) {
  return (
    <Dialog
      open={!!source}
      onOpenChange={() => {
        onClose();
      }}
    >
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-6xl" showClose={false}>
        {source && (
          <>
            <DialogTitle className="sr-only">Source Details</DialogTitle>
            <div className="w-full">
              <SourceDetail
                source={source}
                onLoadFileContent={onLoadFileContent}
                isGeneratingSummary={isGeneratingSummary}
                summary={summary}
                onSave={onSave}
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
