import { processSource } from "@/lib/services/process-source";
import { createClient } from "@/utils/supabase/server";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify source exists and user has access
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .select("*, notebooks!inner(user_id)")
      .eq("id", id)
      .single();

    if (sourceError || !source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    // Check if user owns the notebook
    if (source.notebooks.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Process the source
    const result = await processSource(id);

    return NextResponse.json({
      ...result,
      message: "Source processed successfully",
    });
  } catch (error) {
    console.error("Error processing source:", error);
    return NextResponse.json(
      {
        error: "Failed to process source",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
