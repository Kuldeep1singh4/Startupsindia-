import imageCompression from 'browser-image-compression'

export type ImageCompressionProfile = 
  | 'standard' 
  | 'proof' 
  | 'certificate' 
  | 'reward' 
  | 'asset' 
  | 'avatar' 
  | 'thumbnail'

interface ProfileConfig {
  maxSizeMB: number
  maxWidthOrHeight: number
  fileType: string
  initialQuality: number
}

const PROFILES: Record<ImageCompressionProfile, ProfileConfig> = {
  // Standard uploads: task proofs, certificates, rewards, general assets
  // Target: 300–500 KB, max 1920px on the longer side, converted to WebP where supported
  standard: {
    maxSizeMB: 0.4, // ~400 KB target
    maxWidthOrHeight: 1920,
    fileType: 'image/webp',
    initialQuality: 0.85,
  },
  proof: {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1920,
    fileType: 'image/webp',
    initialQuality: 0.85,
  },
  certificate: {
    maxSizeMB: 0.45,
    maxWidthOrHeight: 1920,
    fileType: 'image/webp',
    initialQuality: 0.88,
  },
  reward: {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1920,
    fileType: 'image/webp',
    initialQuality: 0.85,
  },
  asset: {
    maxSizeMB: 0.4,
    maxWidthOrHeight: 1920,
    fileType: 'image/webp',
    initialQuality: 0.85,
  },
  // Avatars & thumbnails: max 800px, target <= 100 KB
  avatar: {
    maxSizeMB: 0.1, // ~100 KB target
    maxWidthOrHeight: 800,
    fileType: 'image/webp',
    initialQuality: 0.8,
  },
  thumbnail: {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 800,
    fileType: 'image/webp',
    initialQuality: 0.8,
  },
}

/**
 * Check if a file is an image that should be compressed.
 * Non-image files (e.g. PDFs, docs) are NOT compressed.
 */
export function isCompressibleImage(file: File): boolean {
  if (!file || !file.type) return false
  const type = file.type.toLowerCase()
  // SVG images are vector graphics and should not be raster compressed
  if (type.includes('svg')) return false
  return type.startsWith('image/')
}

/**
 * Shared client-side image compression utility.
 * Compresses images BEFORE upload to Supabase Storage or database payload.
 *
 * Rules:
 * - If non-image (e.g. PDF), returns the original file untouched.
 * - Caps max dimension at 1920px (or 800px for avatar/thumbnail).
 * - Converts to WebP format where supported, falling back to original otherwise.
 * - Caps size to 300–500 KB (or 100 KB for avatar).
 */
export async function compressImage(
  file: File,
  profile: ImageCompressionProfile = 'standard'
): Promise<File> {
  // Non-image check (do not touch non-images like PDFs)
  if (!isCompressibleImage(file)) {
    return file
  }

  const config = PROFILES[profile] || PROFILES.standard

  const options = {
    maxSizeMB: config.maxSizeMB,
    maxWidthOrHeight: config.maxWidthOrHeight,
    fileType: config.fileType,
    initialQuality: config.initialQuality,
    useWebWorker: true,
  }

  try {
    const compressedBlob = await imageCompression(file, options)

    // Determine correct filename and extension
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
    const isWebP = compressedBlob.type === 'image/webp'
    const newExtension = isWebP ? 'webp' : (file.name.split('.').pop() || 'jpg')
    const newName = `${baseName}.${newExtension}`

    const compressedFile = new File([compressedBlob], newName, {
      type: compressedBlob.type || (isWebP ? 'image/webp' : file.type),
      lastModified: Date.now(),
    })

    const originalKb = (file.size / 1024).toFixed(1)
    const compressedKb = (compressedFile.size / 1024).toFixed(1)
    console.info(
      `[ImageCompression] "${file.name}" (${originalKb} KB) -> "${newName}" (${compressedKb} KB, ${compressedFile.type}) using profile "${profile}"`
    )

    return compressedFile
  } catch (error) {
    console.warn('[ImageCompression] Primary WebP compression failed, attempting fallback:', error)

    // Fallback: try compression without forced fileType conversion
    try {
      const fallbackOptions = {
        maxSizeMB: config.maxSizeMB,
        maxWidthOrHeight: config.maxWidthOrHeight,
        useWebWorker: true,
      }
      const fallbackBlob = await imageCompression(file, fallbackOptions)
      return new File([fallbackBlob], file.name, {
        type: fallbackBlob.type || file.type,
        lastModified: Date.now(),
      })
    } catch (fallbackError) {
      console.error('[ImageCompression] Fallback compression failed, using original file:', fallbackError)
      return file
    }
  }
}

/**
 * Helper to convert any File or Blob to a base64 Data URL.
 */
export function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (err) => reject(err)
    reader.readAsDataURL(file)
  })
}

/**
 * Compresses an image and directly returns both the compressed File and its Data URL.
 * Ideal for components that preview and store base64 artwork/templates.
 */
export async function compressImageToDataUrl(
  file: File,
  profile: ImageCompressionProfile = 'standard'
): Promise<{ file: File; dataUrl: string }> {
  const compressedFile = await compressImage(file, profile)
  const dataUrl = await fileToDataUrl(compressedFile)
  return { file: compressedFile, dataUrl }
}
