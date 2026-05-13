import { auth } from '@/lib/auth'
import { uploadImage, deleteImage, getOptimizedUrl } from '@/lib/cloudinary'
import { NextRequest } from 'next/server'

// Only admins may upload or delete images
async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if ((session.user as { role?: string }).role !== 'ADMIN') {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return null
}

/**
 * POST /api/upload
 * Accepts multipart/form-data with a single "file" field.
 * Returns the Cloudinary upload result including the secure URL and public ID.
 */
export async function POST(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return Response.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Validate file size (max 10 MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return Response.json(
        { error: 'File too large. Maximum size is 10 MB' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const result = await uploadImage(buffer)

    return Response.json({
      publicId: result.publicId,
      url: result.secureUrl,
      width: result.width,
      height: result.height,
      format: result.format,
    })
  } catch (error) {
    console.error('Image upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}

/**
 * DELETE /api/upload
 * Body: { publicId: string }
 * Deletes an image from Cloudinary by its public ID.
 */
export async function DELETE(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const body = await request.json()
    const { publicId } = body as { publicId?: string }

    if (!publicId || typeof publicId !== 'string') {
      return Response.json({ error: 'publicId is required' }, { status: 400 })
    }

    await deleteImage(publicId)

    return Response.json({ success: true })
  } catch (error) {
    console.error('Image deletion error:', error)
    return Response.json({ error: 'Deletion failed' }, { status: 500 })
  }
}

/**
 * GET /api/upload?publicId=...&width=...&height=...
 * Returns an optimized URL for the given Cloudinary public ID.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const publicId = searchParams.get('publicId')

  if (!publicId) {
    return Response.json({ error: 'publicId is required' }, { status: 400 })
  }

  const width = searchParams.get('width')
  const height = searchParams.get('height')

  const url = getOptimizedUrl(publicId, {
    width: width ? parseInt(width, 10) : undefined,
    height: height ? parseInt(height, 10) : undefined,
  })

  return Response.json({ url })
}
