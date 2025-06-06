'use client';

import { NotebookModal } from '@/components/notebook-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/utils/supabase/client';
import { BookOpen, Grid, List, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  visibility: 'PRIVATE' | 'PUBLIC' | 'SHARED';
  created_at: string;
  updated_at: string;
  user_id: string;
  cover_image_url: string | null;
  tags: string[] | null;
}

export default function NotebooksPage() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const loadNotebooks = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();

      if (!currentUser) {
        setNotebooks([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotebooks(data || []);
    } catch (error) {
      console.error('Error loading notebooks:', error);
      toast.error('Failed to load notebooks');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotebooks();
  }, []);

  const handleNotebookCreated = async () => {
    // Just reload the notebooks after creation
    loadNotebooks();
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

  const filteredNotebooks = notebooks.filter(
    notebook =>
      notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notebook.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="bg-muted mb-4 h-8 w-3/4 rounded"></div>
            <div className="bg-muted mb-8 h-4 w-1/2 rounded"></div>
            <div className="bg-muted h-[600px] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="from-primary to-primary/60 mb-2 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
              Notebooks
            </h1>
            <p className="text-muted-foreground">Organize and manage your sources in notebooks</p>
          </div>
          <Button onClick={() => setIsNotebookModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Notebook
          </Button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Filters and Search */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="text-muted-foreground h-4 w-4" />
                </div>
                <Input
                  placeholder="Search notebooks..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                size="icon"
                className="h-9 w-9"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                size="icon"
                className="h-9 w-9"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Notebooks List */}
          {filteredNotebooks.length === 0 ? (
            <div className="text-muted-foreground py-12 text-center">No notebooks found</div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col gap-6'
              }
            >
              {filteredNotebooks.map(notebook => (
                <div
                  key={notebook.id}
                  className={`bg-card border-border/50 hover:border-primary/50 cursor-pointer rounded-xl border p-6 shadow-lg transition-all duration-200 ${
                    viewMode === 'list' ? 'flex items-start gap-4' : ''
                  }`}
                  onClick={() => router.push(`/notebooks/${notebook.id}`)}
                >
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary rounded-md p-1.5">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {formatDate(notebook.created_at)}
                      </span>
                    </div>
                    <div className="group-hover:text-primary line-clamp-1 text-lg font-medium transition-colors">
                      {notebook.title}
                    </div>
                    {notebook.description && (
                      <div className="text-muted-foreground line-clamp-2 text-sm">
                        {notebook.description}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          notebook.visibility === 'PRIVATE'
                            ? 'bg-muted text-muted-foreground'
                            : notebook.visibility === 'PUBLIC'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-blue-500/10 text-blue-500'
                        }`}
                      >
                        {notebook.visibility.charAt(0) + notebook.visibility.slice(1).toLowerCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <NotebookModal
        isOpen={isNotebookModalOpen}
        onClose={() => setIsNotebookModalOpen(false)}
        onNotebookCreated={handleNotebookCreated}
      />
    </div>
  );
}
