import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY || '',
  },
});

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Missing filename or contentType' }, { status: 400 });
    }

    const command = new PutObjectCommand({
      Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
      Key: `recordings/${filename}`,
      ContentType: contentType,
    });

    // URL expires in 1 hour
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    // Provide a way to construct the public URL if needed
    const publicUrl = process.env.CLOUDFLARE_PUBLIC_BASE_URL 
      ? `${process.env.CLOUDFLARE_PUBLIC_BASE_URL}/recordings/${filename}`
      : undefined;

    return NextResponse.json({ uploadUrl, publicUrl });
  } catch (error) {
    console.error('Error generating upload url:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}
