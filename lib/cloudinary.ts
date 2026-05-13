import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface UploadResult {
  publicId: string
  url: string
  secureUrl: string
  width: number
  height: number
  format: string
}

/**
 * Upload an image to Cloudinary with optimization settings.
 * Images are stored under the "dachhomeandbody/products" folder.
 */
export async function uploadImage(
  source: string | Buffer,
  folder = 'dachhomeandbody/products'
): Promise<UploadResult> {
  const options = {
    folder,
    // Auto-select best format (WebP/AVIF where supported)
    fetch_format: 'auto',
    // Auto-adjust quality for optimal file size
    quality: 'auto',
    // Responsive breakpoints for srcset generation
    responsive_breakpoints: {
      create_derived: true,
      bytes_step: 20000,
      min_width: 200,
      max_width: 1400,
    },
  }

  const result = await new Promise<UploadResult>((resolve, reject) => {
    if (Buffer.isBuffer(source)) {
      // Upload from buffer
      cloudinary.uploader
        .upload_stream(options, (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error('Upload failed'))
            return
          }
          resolve({
            publicId: uploadResult.public_id,
            url: uploadResult.url,
            secureUrl: uploadResult.secure_url,
            width: uploadResult.width,
            height: uploadResult.height,
            format: uploadResult.format,
          })
        })
        .end(source)
    } else {
      // Upload from URL or base64 data URI
      cloudinary.uploader.upload(source, options, (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error('Upload failed'))
          return
        }
        resolve({
          publicId: uploadResult.public_id,
          url: uploadResult.url,
          secureUrl: uploadResult.secure_url,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
        })
      })
    }
  })

  return result
}

/**
 * Delete an image from Cloudinary by its public ID.
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

/**
 * Generate an optimized image URL with transformation options.
 * Defaults to auto format and quality with a max width of 800px.
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
  } = {}
): string {
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: options.quality ?? 'auto',
    width: options.width,
    height: options.height,
    crop: options.crop ?? 'fill',
    secure: true,
  })
}

export default cloudinary
