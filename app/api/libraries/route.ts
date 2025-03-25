import { getUser, createLibrary, getLibrariesByUserId } from '@/lib/db/queries';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { user } = await getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { name, description, imagePath } = await request.json();

    if (!name) {
      return new Response('Name is required', { status: 400 });
    }

    const libraryId = uuidv4();

    const library = await createLibrary({
      id: libraryId,
      name,
      description,
      imagePath,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify(library), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create library', error);
    return new Response('An error occurred while creating the library', {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const { user } = await getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const libraries = await getLibrariesByUserId({ userId: user.id });

    return new Response(JSON.stringify(libraries), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to get libraries', error);
    return new Response('An error occurred while fetching libraries', {
      status: 500,
    });
  }
}
