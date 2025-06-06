'use client';

import { SummarizeTool, SummaryResponse } from '@/components/summarize-tool';
import { SummaryResults } from '@/components/summary-results';
import { useAuth } from '@/contexts/auth-context';
import { Link } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SummarizePage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read summary from localStorage if it exists
    const storedSummary = localStorage.getItem('pendingSummary');
    if (storedSummary) {
      try {
        const parsedSummary = JSON.parse(storedSummary);
        setSummary(parsedSummary);
        // Clear the stored summary
        localStorage.removeItem('pendingSummary');
      } catch (error) {
        console.error('Failed to parse summary from localStorage:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const handleSummaryGenerated = async (newSummary: SummaryResponse) => {
    setSummary(newSummary);

    if (!user) {
      // The API will handle creating a guest account
      setIsGuest(true);
      toast.info(
        "We've created a temporary guest account to save your summaries. Add an email to keep them forever!",
        {
          duration: 5000,
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <div className="animate-pulse">
            <div className="bg-muted mb-4 h-8 w-3/4 rounded"></div>
            <div className="bg-muted mb-8 h-4 w-1/2 rounded"></div>
            <div className="bg-muted h-[400px] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="from-background to-muted/20 min-h-screen bg-gradient-to-b">
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="from-primary to-primary/60 mb-4 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
            AI Summary Generator
          </h1>
          <p className="text-muted-foreground">
            Transform any text, article, or document into a clear, concise summary with key insights
          </p>
          {isGuest && (
            <div className="text-muted-foreground mt-4 text-sm">
              <p>Your files and summaries are saved securely with a guest account.</p>
              <p className="mt-1">
                <Link href="/auth/signup" className="text-primary hover:underline">
                  Sign up
                </Link>{' '}
                to access them anytime.
              </p>
            </div>
          )}
        </div>

        <SummarizeTool onSummaryGenerated={handleSummaryGenerated} />

        {summary && <SummaryResults summary={summary} className="mt-8" />}
      </div>
    </div>
  );
}
