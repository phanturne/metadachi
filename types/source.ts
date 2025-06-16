export type SourceType = 'TEXT' | 'URL' | 'FILE';

export interface Source {
  id: string;
  type: SourceType;
  content: string | null;
  url: string | null;
  file_name: string | null;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
  user_id: string;
  title: string;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  summary?: {
    id: string;
    summary_text: string;
    key_points: string[];
    quotes: string[];
    tags: string[];
  } | null;
}
