import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromCookies } from '@/lib/adminAuth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const isAdmin = await getAdminFromCookies();
  if (!isAdmin) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Verify it is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image files (JPG, PNG, WebP, GIF, AVIF) are allowed' },
        { status: 400 }
      );
    }

    // Limit size to 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image size exceeds maximum limit of 10MB' },
        { status: 400 }
      );
    }

    // Determine safe file extension
    const extFromName = path.extname(file.name).toLowerCase().replace(/[^a-z0-9]/g, '');
    let ext = extFromName || 'jpg';
    if (!extFromName) {
      if (file.type === 'image/png') ext = 'png';
      else if (file.type === 'image/webp') ext = 'webp';
      else if (file.type === 'image/gif') ext = 'gif';
      else if (file.type === 'image/avif') ext = 'avif';
      else ext = 'jpg';
    }

    // Create unique filename
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const filename = `item_${uniqueSuffix}.${ext}`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process and upload image' },
      { status: 500 }
    );
  }
}
