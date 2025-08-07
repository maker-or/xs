import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import { repo } from '~/server/db/schema';

export async function POST(req: Request) {
  try {
    const { userId } = (await auth()) as { userId: string | null };

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received request body:', JSON.stringify(body, null, 2));

    // Extract all fields from the request body
    const {
      year,
      branch,
      tags,
      name,
      filename,
      fileurl,
      subject,
      type,
      tag,
      url,
    } = body;

    // Validate required fields - allow empty fileurl for manual submissions
    if (!(year && branch && subject && type)) {
      console.log('Validation failed. Missing fields:', {
        year: !year,
        branch: !branch,
        subject: !subject,
        type: !type,
      });
      return NextResponse.json(
        { error: 'Missing required fields: year, branch, subject, type' },
        { status: 400 }
      );
    }

    // Check if we have either a filename or fileurl
    if (!(filename || name)) {
      console.log('Validation failed. Missing filename/name');
      return NextResponse.json(
        { error: 'Missing required field: filename or name' },
        { status: 400 }
      );
    }

    // Process tags - use either 'tags' or 'tag' field, whichever is available
    let processedTags = '';
    if (tags) {
      processedTags = typeof tags === 'string' ? tags : tags.join(',');
    } else if (tag) {
      processedTags = typeof tag === 'string' ? tag : tag.join(',');
    }

    // Insert into database using the repo schema
    const post = await db.insert(repo).values({
      userId,
      filename: filename || name || 'untitled',
      fileurl: fileurl || url || '',
      tags: processedTags,
      year: year.toString(),
      branch: branch.toUpperCase(),
      subject: subject.toUpperCase(),
      type: type || 'notes',
    });

    return NextResponse.json({
      success: true,
      post,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
