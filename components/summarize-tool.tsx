'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAnonymousAuth } from '@/hooks/use-anonymous-auth';
import { Link as LinkIcon, Loader2, Sparkles, Type, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { FileUpload } from './file-upload';

export type SummaryResponse = {
  summary: string;
  keyPoints: string[];
  quotes: string[];
  tags: string[];
};

export const SUMMARY_PRESETS = {
  concise: {
    label: 'Concise',
    instructions:
      'Provide a brief, to-the-point summary focusing on the most essential information. Keep it under 100 words.',
  },
  detailed: {
    label: 'Detailed',
    instructions:
      'Provide a comprehensive analysis with in-depth insights and thorough coverage of all major points.',
  },
  academic: {
    label: 'Academic',
    instructions:
      'Analyze the content from an academic perspective, highlighting methodology, findings, and implications.',
  },
  business: {
    label: 'Business',
    instructions:
      'Focus on business implications, market insights, and actionable takeaways for professionals.',
  },
  custom: {
    label: 'Custom',
    instructions: '',
  },
} as const;

export type SummaryPreset = keyof typeof SUMMARY_PRESETS;

interface SummarizeToolProps {
  onSummaryGenerated?: (summary: SummaryResponse) => void;
  className?: string;
  showTitle?: boolean;
}

export function SummarizeTool({
  onSummaryGenerated,
  className = '',
  showTitle = false,
}: SummarizeToolProps) {
  const { ensureAuthenticated } = useAnonymousAuth();
  const [inputType, setInputType] = useState<'text' | 'url' | 'file'>('text');
  const [input, setInput] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<SummaryPreset>('concise');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [, setSummary] = useState<SummaryResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handlePresetChange = (preset: SummaryPreset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      setCustomInstructions(SUMMARY_PRESETS[preset].instructions);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isGenerating) return;

    if (inputType === 'file' && !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }
    if (inputType !== 'file' && !input.trim()) return;

    setIsGenerating(true);
    setSummary(null);

    try {
      // Ensure user is authenticated before proceeding
      await ensureAuthenticated();

      const formData = new FormData();
      formData.append('type', inputType.toUpperCase());

      if (inputType === 'file' && selectedFile) {
        formData.append('file', selectedFile);
      } else {
        formData.append('content', input);
        if (inputType === 'url') {
          formData.append('url', input);
        }
      }

      formData.append('customInstructions', customInstructions);

      const sourceResponse = await fetch('/api/sources', {
        method: 'POST',
        body: formData,
      });

      const sourceData = await sourceResponse.json();

      if (!sourceResponse.ok) {
        if (sourceResponse.status === 429) {
          // Rate limit exceeded
          toast.error(
            <div className="space-y-1">
              <p className="font-medium">Rate Limit Exceeded</p>
              <p className="text-muted-foreground text-sm">{sourceData.message}</p>
              {sourceData.reset && (
                <p className="text-muted-foreground text-sm">
                  Resets in {new Date(sourceData.reset).toLocaleTimeString()}
                </p>
              )}
            </div>,
            {
              duration: 8000, // Show for 8 seconds
            }
          );
        } else {
          toast.error(sourceData.error || 'Failed to create source');
        }
        setIsGenerating(false);
        return;
      }

      // Show transition message if we're using a smaller model
      if (sourceData.rateLimit?.isTransitioningToSmallerModel) {
        toast.info(sourceData.rateLimit.transitionMessage, {
          duration: 5000, // Show for 5 seconds
        });
      }

      const newSummary = {
        summary: sourceData.summary,
        keyPoints: sourceData.keyPoints,
        quotes: sourceData.quotes,
        tags: sourceData.tags,
      };

      onSummaryGenerated?.(newSummary);

      toast.success('Summary generated successfully!');
      setIsGenerating(false);
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit request';
      toast.error(errorMessage);
      setIsGenerating(false);
    }
  };

  return (
    <div className={`bg-card border-border/50 rounded-xl border p-4 shadow-lg sm:p-6 ${className}`}>
      {showTitle && (
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="from-primary to-primary/60 mb-3 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:mb-4 sm:text-4xl">
            AI Summary Generator
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Transform any text, article, or document into a clear, concise summary with key insights
          </p>
        </div>
      )}

      <div className="mb-4 flex flex-row gap-2 sm:mb-6 sm:gap-3">
        <Button
          variant={inputType === 'text' ? 'default' : 'outline'}
          onClick={() => setInputType('text')}
          className="flex-1 gap-2"
        >
          <Type className="h-4 w-4" />
          <span className="hidden text-sm sm:inline-block sm:text-base">Text Input</span>
        </Button>
        <Button
          variant={inputType === 'url' ? 'default' : 'outline'}
          onClick={() => setInputType('url')}
          className="flex-1 gap-2"
        >
          <LinkIcon className="h-4 w-4" />
          <span className="hidden text-sm sm:inline-block sm:text-base">URL Input</span>
        </Button>
        <Button
          variant={inputType === 'file' ? 'default' : 'outline'}
          onClick={() => setInputType('file')}
          className="flex-1 gap-2"
        >
          <Upload className="h-4 w-4" />
          <span className="hidden text-sm sm:inline-block sm:text-base">File Upload</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="input" className="text-sm sm:text-base">
            {inputType === 'text'
              ? 'Enter your text'
              : inputType === 'url'
                ? 'Enter URL'
                : 'Upload file'}
          </Label>
          {inputType === 'file' ? (
            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={file => {
                setSelectedFile(file);
                setInput(file?.name || '');
              }}
              disabled={isGenerating}
              className="w-full"
            />
          ) : (
            <Textarea
              id="input"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={
                inputType === 'text' ? 'Paste your text here...' : 'https://example.com/article'
              }
              className="min-h-[120px] resize-none text-sm sm:min-h-[150px] sm:text-base"
              disabled={isGenerating}
            />
          )}
        </div>

        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="customInstructions" className="text-sm sm:text-base">
            Summary Style
          </Label>
          <div className="mb-3 flex flex-wrap gap-1 sm:mb-4 sm:gap-2">
            {Object.entries(SUMMARY_PRESETS).map(([key, { label }]) => (
              <Button
                key={key}
                type="button"
                variant={selectedPreset === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetChange(key as SummaryPreset)}
                className="rounded-full text-xs sm:text-sm"
              >
                {label}
              </Button>
            ))}
          </div>
          <Textarea
            id="customInstructions"
            value={customInstructions}
            onChange={e => {
              setCustomInstructions(e.target.value);
              setSelectedPreset('custom');
            }}
            placeholder="Add any specific requirements to tailor the summary..."
            className="min-h-[60px] resize-none text-sm sm:min-h-[80px] sm:text-base"
            disabled={isGenerating}
          />
        </div>

        <Button
          type="submit"
          disabled={isGenerating || (inputType === 'file' ? !selectedFile : !input.trim())}
          className="h-10 w-full gap-2 sm:h-11"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm sm:text-base">Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span className="text-sm sm:text-base">Generate Summary</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
