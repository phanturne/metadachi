'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Globe, Plus, Sparkles, Tag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardData {
  counts: {
    total: number;
    text: number;
    url: number;
    file: number;
  };
  recentSources: {
    id: string;
    type: 'TEXT' | 'URL' | 'FILE';
    title: string;
    createdAt: string;
    hasSummary: boolean;
    summary?: string;
    tags: string[];
  }[];
  popularTags: string[];
}

function SkeletonCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="bg-muted h-4 w-24 animate-pulse rounded" />
        <div className="bg-muted h-4 w-4 animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="bg-muted mb-2 h-8 w-16 animate-pulse rounded" />
        <div className="bg-muted h-3 w-32 animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

function SkeletonRecentSource() {
  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border p-2">
      <div className="bg-muted h-8 w-8 animate-pulse rounded-lg" />
      <div className="flex-1">
        <div className="bg-muted mb-2 h-4 w-48 animate-pulse rounded" />
        <div className="bg-muted h-3 w-24 animate-pulse rounded" />
      </div>
      <div className="bg-muted h-6 w-16 animate-pulse rounded" />
    </div>
  );
}

function SkeletonQuickAction() {
  return <div className="bg-muted h-10 w-full animate-pulse rounded" />;
}

function SkeletonTag() {
  return <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />;
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto space-y-6 p-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="bg-muted h-8 w-32 animate-pulse rounded" />
          <div className="bg-muted h-10 w-32 animate-pulse rounded" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Recent Activity and Quick Actions Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="bg-muted h-6 w-32 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <SkeletonRecentSource />
                <SkeletonRecentSource />
                <SkeletonRecentSource />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="bg-muted h-6 w-32 animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <SkeletonQuickAction />
                <SkeletonQuickAction />
                <SkeletonQuickAction />
                <SkeletonQuickAction />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tags Overview Skeleton */}
        <Card>
          <CardHeader className="pb-2">
            <div className="bg-muted h-6 w-32 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <SkeletonTag />
              <SkeletonTag />
              <SkeletonTag />
              <SkeletonTag />
              <SkeletonTag />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-destructive text-center">
          <p>Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/summarize">
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.total}</div>
            <p className="text-muted-foreground text-xs">Across all types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Text Sources</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.text}</div>
            <p className="text-muted-foreground text-xs">Direct text inputs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">URL Sources</CardTitle>
            <Globe className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.url}</div>
            <p className="text-muted-foreground text-xs">Web pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">File Sources</CardTitle>
            <FileText className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.file}</div>
            <p className="text-muted-foreground text-xs">Uploaded files</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Sources */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Recent Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto">
              <div className="space-y-2">
                {data.recentSources.length > 0 ? (
                  data.recentSources.map(source => (
                    <div
                      key={source.id}
                      className="bg-card hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-2 transition-colors"
                    >
                      <div className="bg-primary/10 text-primary rounded-lg p-1.5">
                        {source.type === 'URL' ? (
                          <Globe className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{source.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {new Date(source.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {source.hasSummary && (
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <Sparkles className="h-3 w-3" />
                          <span>Summarized</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <div className="-mt-8 space-y-4 text-center">
                      <div className="bg-primary/10 mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                        <Plus className="text-primary h-6 w-6" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">No sources yet</h3>
                        <p className="text-muted-foreground mx-auto max-w-sm text-sm">
                          Start by adding your first source. You can paste text, add URLs, or upload
                          files.
                        </p>
                      </div>
                      <Button asChild variant="outline" className="mt-4">
                        <Link href="/summarize">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Your First Source
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/summarize">
                  <FileText className="mr-2 h-4 w-4" />
                  Summarize Text
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/summarize">
                  <Globe className="mr-2 h-4 w-4" />
                  Add URL
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/summarize">
                  <FileText className="mr-2 h-4 w-4" />
                  Upload File
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tags Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[100px] overflow-y-auto">
            {data.popularTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.popularTags.map(tag => (
                  <div
                    key={tag}
                    className="bg-primary/10 text-primary flex items-center gap-1 rounded-full px-3 py-1 text-sm"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-[100px] items-center justify-center">
                <div className="-mt-4 text-center">
                  <div className="bg-primary/10 mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full">
                    <Tag className="text-primary h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-medium">No tags yet</h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Tags will appear here as you add and summarize sources
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
