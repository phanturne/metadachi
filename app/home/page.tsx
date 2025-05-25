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
          <Link href="/library">
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
            <div className="space-y-2">
              {data.recentSources.map((source) => (
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
                  <div className="flex items-center gap-2">
                    {source.hasSummary && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-full">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary">Summarized</span>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
                      <Link href={`/library`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))}
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
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/library">
                  <FileText className="mr-2 h-4 w-4" />
                  View All Sources
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/library?type=text">
                  <FileText className="mr-2 h-4 w-4" />
                  Add Text Source
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/library?type=url">
                  <Globe className="mr-2 h-4 w-4" />
                  Add URL Source
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/library?type=file">
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
          <div className="flex flex-wrap gap-2">
            {data.popularTags.map((tag) => (
              <div
                key={tag}
                className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-sm text-primary"
              >
                <Tag className="h-3 w-3" />
                {tag}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
