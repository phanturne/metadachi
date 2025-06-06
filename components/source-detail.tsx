import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Book,
  Edit2,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Save,
  Sparkles,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface Source {
  id: string;
  type: 'TEXT' | 'URL' | 'FILE';
  content: string | null;
  url: string | null;
  file_name: string | null;
  file_path?: string | null;
  created_at: string;
  title: string;
  summary?: {
    id: string;
    summary_text: string;
    key_points: string[];
    quotes: string[];
    tags: string[];
  } | null;
}

interface SourceDetailProps {
  source: Source;
  onLoadFileContent?: (filePath: string) => Promise<void>;
  isGeneratingSummary?: boolean;
  summary?: string;
  onSave?: (updates: {
    title: string;
    summary?: {
      summary_text: string;
      key_points: string[];
      quotes: string[];
      tags: string[];
    };
  }) => Promise<void>;
}

export function SourceDetail({
  source,
  onLoadFileContent,
  isGeneratingSummary = false,
  summary = '',
  onSave,
}: SourceDetailProps) {
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(source.title);
  const [editedSummary, setEditedSummary] = useState(source.summary?.summary_text || '');
  const [editedKeyPoints, setEditedKeyPoints] = useState<string[]>(
    source.summary?.key_points || []
  );
  const [editedQuotes, setEditedQuotes] = useState<string[]>(source.summary?.quotes || []);
  const [editedTags, setEditedTags] = useState<string[]>(source.summary?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'URL':
        return <Globe className="h-4 w-4" />;
      case 'FILE':
        return <FileText className="h-4 w-4" />;
      default:
        return <Book className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSave = async () => {
    if (!onSave) return;

    try {
      setIsSaving(true);
      await onSave({
        title: editedTitle,
        summary: {
          summary_text: editedSummary,
          key_points: editedKeyPoints,
          quotes: editedQuotes,
          tags: editedTags,
        },
      });
      setIsEditing(false);
      toast.success('Changes saved successfully');
    } catch {
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyPointChange = (index: number, value: string) => {
    const newKeyPoints = [...editedKeyPoints];
    newKeyPoints[index] = value;
    setEditedKeyPoints(newKeyPoints);
  };

  const handleQuoteChange = (index: number, value: string) => {
    const newQuotes = [...editedQuotes];
    newQuotes[index] = value;
    setEditedQuotes(newQuotes);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      <div className="w-full max-w-full overflow-hidden">
        <div className="mb-4 flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-lg p-2">
            {getSourceIcon(source.type)}
          </div>
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={e => setEditedTitle(e.target.value)}
                className="text-lg font-semibold"
              />
            ) : (
              <h3 className="text-lg font-semibold">{source.title}</h3>
            )}
            <div className="text-muted-foreground text-sm">{formatDate(source.created_at)}</div>
          </div>
          {onSave && (
            <Button
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              disabled={isSaving}
              className="h-9 gap-2 transition-all duration-200 hover:scale-105"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                <Save className="h-4 w-4" />
              ) : (
                <Edit2 className="h-4 w-4" />
              )}
              <span>{isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit'}</span>
            </Button>
          )}
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-muted-foreground text-sm font-medium">Content</div>
              {source.type === 'URL' && source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary flex items-center gap-1 text-sm hover:underline"
                >
                  {source.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            {source.type === 'FILE' && !isGeneratingSummary && !summary && onLoadFileContent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => source.file_path && onLoadFileContent(source.file_path)}
                className="h-8"
              >
                Load File Content
              </Button>
            )}
          </div>
          {source.type === 'FILE' ? (
            <div>
              {isGeneratingSummary ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="text-primary h-6 w-6 animate-spin" />
                </div>
              ) : summary ? (
                <div className="relative">
                  <div
                    className={`bg-muted/50 rounded-lg p-4 break-words whitespace-pre-wrap transition-all duration-200 ${isContentExpanded ? 'max-h-none' : 'max-h-[300px]'} overflow-y-auto`}
                  >
                    {summary}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="from-background absolute right-0 bottom-0 bg-gradient-to-t to-transparent px-4 py-2 hover:bg-transparent"
                    onClick={() => setIsContentExpanded(!isContentExpanded)}
                  >
                    {isContentExpanded ? 'Collapse' : 'Expand'}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="relative w-full max-w-full overflow-hidden">
              <div
                className={`bg-muted/50 rounded-lg p-4 break-words whitespace-pre-wrap transition-all duration-200 ${isContentExpanded ? 'max-h-none' : 'max-h-[300px]'} w-full max-w-full overflow-y-auto`}
              >
                <div className="break-all">{source.content || source.url}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="from-background absolute right-0 bottom-0 bg-gradient-to-t to-transparent px-4 py-2 hover:bg-transparent"
                onClick={() => setIsContentExpanded(!isContentExpanded)}
              >
                {isContentExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>
          )}
        </div>
      </div>
      {source.summary && (
        <div className="space-y-4">
          <div>
            <div className="text-primary mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="font-medium">Summary</span>
            </div>
            {isEditing ? (
              <Textarea
                value={editedSummary}
                onChange={e => setEditedSummary(e.target.value)}
                className="min-h-[100px] w-full"
              />
            ) : (
              <div className="text-muted-foreground whitespace-pre-wrap">
                {source.summary.summary_text}
              </div>
            )}
          </div>
          {source.summary.key_points.length > 0 && (
            <div>
              <div className="text-muted-foreground mb-2 text-sm font-medium">Key Points</div>
              {isEditing ? (
                <div className="space-y-2">
                  {editedKeyPoints.map((point, index) => (
                    <Input
                      key={index}
                      value={point}
                      onChange={e => handleKeyPointChange(index, e.target.value)}
                      placeholder={`Key point ${index + 1}`}
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditedKeyPoints([...editedKeyPoints, ''])}
                  >
                    Add Key Point
                  </Button>
                </div>
              ) : (
                <ul className="text-muted-foreground list-inside list-disc space-y-1.5">
                  {source.summary.key_points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {source.summary.quotes.length > 0 && (
            <div>
              <div className="text-muted-foreground mb-2 text-sm font-medium">Notable Quotes</div>
              {isEditing ? (
                <div className="space-y-2">
                  {editedQuotes.map((quote, index) => (
                    <Textarea
                      key={index}
                      value={quote}
                      onChange={e => handleQuoteChange(index, e.target.value)}
                      placeholder={`Quote ${index + 1}`}
                      className="min-h-[60px]"
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditedQuotes([...editedQuotes, ''])}
                  >
                    Add Quote
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {source.summary.quotes.map((quote, index) => (
                    <blockquote
                      key={index}
                      className="border-primary/20 text-muted-foreground border-l-4 pl-4 italic"
                    >
                      {quote}
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
          )}
          <div>
            <div className="text-muted-foreground mb-2 text-sm font-medium">Tags</div>
            {isEditing ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {editedTags.map((tag, index) => (
                    <div
                      key={index}
                      className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a tag..."
                    className="max-w-[200px]"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    Add Tag
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {source.summary.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
