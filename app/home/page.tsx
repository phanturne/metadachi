"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, Plus, Sparkles, Tag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardData {
  counts: {
    total: number;
    text: number;
    url: number;
    file: number;
  };
  recentSources: {
    id: string;
    type: "TEXT" | "URL" | "FILE";
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
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}

function SkeletonRecentSource() {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border bg-card">
      <div className="h-8 w-8 bg-muted rounded-lg animate-pulse" />
      <div className="flex-1">
        <div className="h-4 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 w-24 bg-muted rounded animate-pulse" />
      </div>
      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
    </div>
  );
}

function SkeletonQuickAction() {
  return (
    <div className="h-10 w-full bg-muted rounded animate-pulse" />
  );
}

function SkeletonTag() {
  return (
    <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
  );
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) throw new Error("Failed to fetch dashboard data");
        const data = await response.json();
        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        {/* Recent Activity and Quick Actions Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
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
              <div className="h-6 w-32 bg-muted rounded animate-pulse" />
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
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
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
        <div className="text-center text-destructive">
          <p>Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button asChild>
          <Link href="/summarize">
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.total}</div>
            <p className="text-xs text-muted-foreground">Across all types</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Text Sources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.text}</div>
            <p className="text-xs text-muted-foreground">Direct text inputs</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">URL Sources</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.url}</div>
            <p className="text-xs text-muted-foreground">Web pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">File Sources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.counts.file}</div>
            <p className="text-xs text-muted-foreground">Uploaded files</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Sources */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Recent Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] overflow-y-auto">
              <div className="space-y-2">
                {data.recentSources.length > 0 ? (
                  data.recentSources.map((source) => (
                    <div key={source.id} className="flex items-center gap-3 p-2 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
                        {source.type === "URL" ? (
                          <Globe className="h-3.5 w-3.5" />
                        ) : (
                          <FileText className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{source.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(source.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      {source.hasSummary && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3" />
                          <span>Summarized</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center space-y-4 -mt-8">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-medium">No sources yet</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Start by adding your first source. You can paste text, add URLs, or upload files.
                        </p>
                      </div>
                      <Button asChild variant="outline" className="mt-4">
                        <Link href="/summarize">
                          <Plus className="h-4 w-4 mr-2" />
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
                  <FileText className="h-4 w-4 mr-2" />
                  Summarize Text
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/summarize">
                  <Globe className="h-4 w-4 mr-2" />
                  Add URL
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/summarize">
                  <FileText className="h-4 w-4 mr-2" />
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
                {data.popularTags.map((tag) => (
                  <div
                    key={tag}
                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm flex items-center gap-1"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[100px] flex items-center justify-center">
                <div className="text-center -mt-4">
                  <div className="mx-auto w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Tag className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="font-medium text-sm">No tags yet</h3>
                  <p className="text-xs text-muted-foreground mt-1">
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
