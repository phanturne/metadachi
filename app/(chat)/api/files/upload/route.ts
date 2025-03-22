import { getUser } from '@/lib/db/queries';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/utils/supabase/server';

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
      message: 'Unsupported file type',
    }),
});

export async function POST(request: Request) {
  const { user } = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(', ');

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Get filename from formData since Blob doesn't have name property
    const filename = (formData.get('file') as File).name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const supabase = await createClient();
      const { data: uploadData, error } = await supabase.storage
        .from('attachments')
        .upload(`${user.id}/${filename}`, fileBuffer, {
          upsert: true,
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('attachments')
        .getPublicUrl(uploadData.path);

      // Prepare enhanced response with url, pathname and contentType
      const enhancedData = {
        url: publicUrlData.publicUrl,
        pathname: filename,
        contentType: file.type,
      };

      return NextResponse.json(enhancedData, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 },
    );
  }
}
