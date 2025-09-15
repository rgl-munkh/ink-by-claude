import { NextRequest, NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/auth/middleware';
import { presignedUploadSchema } from '@/lib/schemas/upload';
import { generatePresignedUploadUrl } from '@/lib/storage/r2';

async function handler(request: AuthenticatedRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = presignedUploadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.issues },
        { status: 400 }
      );
    }

    const { filename, contentType, folder } = result.data;

    // Generate presigned upload URL
    const { uploadUrl, publicUrl, key } = await generatePresignedUploadUrl(
      filename,
      contentType,
      folder
    );

    return NextResponse.json({
      uploadUrl,
      publicUrl,
      key,
      message: 'Presigned upload URL generated successfully',
    });
  } catch (error) {
    console.error('Presigned upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withRole(['tattooist', 'admin'], handler);