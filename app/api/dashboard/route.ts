import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get user first to ensure authentication
    const { data: { user: existingUser }, error: userError } = await supabase.auth.getUser();
    if (userError || !existingUser) {
      // Try to sign in anonymously if no user exists
      const { data: guestData, error: guestError } = await supabase.auth.signInAnonymously();
      if (guestError || !guestData.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Get the current user (either existing or newly created guest)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get source counts by type
    const { data: sourceCounts, error: sourceCountsError } = await supabase
      .from("sources")
      .select("type")
      .eq("user_id", user.id);

    if (sourceCountsError) throw sourceCountsError;

    const counts = {
      total: sourceCounts?.length || 0,
      text: sourceCounts?.filter(s => s.type === "TEXT").length || 0,
      url: sourceCounts?.filter(s => s.type === "URL").length || 0,
      file: sourceCounts?.filter(s => s.type === "FILE").length || 0,
    };

    // Get recent sources with their summaries
    const { data: recentSources, error: recentSourcesError } = await supabase
      .from("sources")
      .select(`
        *,
        summaries (
          summary_text,
          tags
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentSourcesError) throw recentSourcesError;

    // Get popular tags
    const { data: summaries, error: summariesError } = await supabase
      .from("summaries")
      .select("tags")
      .eq("user_id", user.id);

    if (summariesError) throw summariesError;

    // Count tag occurrences
    const tagCounts = (summaries || []).reduce((acc, summary) => {
      if (summary.tags && Array.isArray(summary.tags)) {
        summary.tags.forEach(tag => {
          acc[tag] = (acc[tag] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    // Sort tags by count and get top 5
    const popularTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    return NextResponse.json({
      counts,
      recentSources: (recentSources || []).map(source => ({
        id: source.id,
        type: source.type,
        title: source.type === "FILE" ? source.file_name : 
               source.type === "URL" ? source.url :
               source.content?.slice(0, 50) + "...",
        createdAt: source.created_at,
        hasSummary: source.summaries && source.summaries.length > 0,
        summary: source.summaries?.[0]?.summary_text,
        tags: source.summaries?.[0]?.tags || []
      })),
      popularTags
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
} 