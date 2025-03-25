import { getUser } from '@/lib/db/queries';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    const { user } = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, imagePath } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // First check if the user owns this library
    const { data: library, error: fetchError } = await supabase
      .from('Library')
      .select('userId')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Library not found' }, { status: 404 });
    }

    if (library.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the library
    const { data, error } = await supabase
      .from('Library')
      .update({
        name,
        description,
        imagePath,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update library', error);
    return NextResponse.json(
      { error: 'Failed to update library' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    const { user } = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // First check if the user owns this library
    const { data: library, error: fetchError } = await supabase
      .from('Library')
      .select('userId')
      .eq('id', id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: 'Library not found' }, { status: 404 });
    }

    if (library.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete associated files first
    const { error: filesError } = await supabase
      .from('File')
      .delete()
      .eq('libraryId', id);

    if (filesError) {
      console.error('Error deleting files:', filesError);
    }

    // Delete the library
    const { error } = await supabase.from('Library').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete library', error);
    return NextResponse.json(
      { error: 'Failed to delete library' },
      { status: 500 },
    );
  }
}
