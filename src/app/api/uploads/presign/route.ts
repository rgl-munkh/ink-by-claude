import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const presignSchema = z.object({
  filenames: z.array(z.object({
    name: z.string(),
    contentType: z.string(),
  })),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filenames } = presignSchema.parse(body);

    // Mock R2 presigned URLs for now
    const presignedUrls = filenames.map((file) => {
      const fileId = crypto.randomUUID();
      const filename = `${fileId}-${file.name}`;

      return {
        uploadUrl: `https://mock-r2-bucket.com/upload/${filename}?presigned=true`,
        publicUrl: `https://mock-r2-bucket.com/public/${filename}`,
        filename: filename,
      };
    });

    return NextResponse.json({
      success: true,
      urls: presignedUrls,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error generating presigned URLs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}