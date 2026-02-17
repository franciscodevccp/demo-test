/**
 * Magic numbers (file signatures) for common image types
 */
const IMAGE_SIGNATURES: Record<string, number[][]> = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46], // RIFF
                    [0x57, 0x45, 0x42, 0x50]], // WEBP
}

const VIDEO_SIGNATURES: Record<string, number[][]> = {
    'video/mp4': [[0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // mp4
                  [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
                  [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70]],
    'video/webm': [[0x1A, 0x45, 0xDF, 0xA3]], // WebM
    'video/quicktime': [[0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74]], // QuickTime
}

/**
 * Validates file type by checking magic numbers (file signatures)
 * This is more secure than relying on MIME type alone
 */
export async function validateFileTypeByMagicNumber(
    file: File,
    allowedTypes: string[]
): Promise<{ valid: boolean; detectedType: string | null; error?: string }> {
    // Read first bytes of the file
    const buffer = await file.slice(0, 32).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    // Check image signatures
    for (const mimeType of allowedTypes) {
        if (mimeType.startsWith('image/')) {
            const signatures = IMAGE_SIGNATURES[mimeType]
            if (signatures) {
                for (const signature of signatures) {
                    if (matchesSignature(bytes, signature)) {
                        // For WEBP, we need additional check
                        if (mimeType === 'image/webp') {
                            if (bytes.length >= 12 && 
                                bytes[8] === 0x57 && bytes[9] === 0x45 && 
                                bytes[10] === 0x42 && bytes[11] === 0x50) {
                                return { valid: true, detectedType: mimeType }
                            }
                        } else {
                            return { valid: true, detectedType: mimeType }
                        }
                    }
                }
            }
        }

        if (mimeType.startsWith('video/')) {
            const signatures = VIDEO_SIGNATURES[mimeType]
            if (signatures) {
                for (const signature of signatures) {
                    if (matchesSignature(bytes, signature, 0, true)) { // Videos can match at different offsets
                        return { valid: true, detectedType: mimeType }
                    }
                }
            }
        }
    }

    return {
        valid: false,
        detectedType: null,
        error: `Tipo de archivo no válido. Tipos permitidos: ${allowedTypes.join(', ')}`
    }
}

/**
 * Checks if bytes match a signature at a specific offset
 */
function matchesSignature(
    bytes: Uint8Array,
    signature: number[],
    offset: number = 0,
    flexibleOffset: boolean = false
): boolean {
    if (flexibleOffset) {
        // For videos, signatures might appear at different offsets (typically within first 12 bytes)
        for (let i = 0; i <= Math.min(12, bytes.length - signature.length); i++) {
            if (matchesSignature(bytes, signature, i, false)) {
                return true
            }
        }
        return false
    }

    if (offset + signature.length > bytes.length) {
        return false
    }

    for (let i = 0; i < signature.length; i++) {
        if (bytes[offset + i] !== signature[i]) {
            return false
        }
    }

    return true
}

/**
 * Validates file extension
 */
export function validateFileExtension(
    filename: string,
    allowedExtensions: string[]
): boolean {
    const extension = filename.split('.').pop()?.toLowerCase()
    if (!extension) {
        return false
    }
    return allowedExtensions.includes(extension)
}

/**
 * Validates file size
 */
export function validateFileSize(file: File, maxSizeBytes: number): boolean {
    return file.size <= maxSizeBytes
}

/**
 * Comprehensive file validation combining MIME type, magic numbers, extension, and size
 */
export async function validateFile(
    file: File,
    options: {
        allowedTypes: string[]
        allowedExtensions?: string[]
        maxSizeBytes?: number
        requireMagicNumber?: boolean
    }
): Promise<{ valid: boolean; error?: string }> {
    const {
        allowedTypes,
        allowedExtensions,
        maxSizeBytes = 5 * 1024 * 1024, // 5MB default
        requireMagicNumber = true
    } = options

    // 1. Validate MIME type (client-side check)
    if (!allowedTypes.some(type => file.type.startsWith(type.split('/')[0] + '/'))) {
        return {
            valid: false,
            error: `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`
        }
    }

    // 2. Validate file extension if provided
    if (allowedExtensions) {
        if (!validateFileExtension(file.name, allowedExtensions)) {
            return {
                valid: false,
                error: `Extensión de archivo no permitida. Extensiones permitidas: ${allowedExtensions.join(', ')}`
            }
        }
    }

    // 3. Validate file size
    if (!validateFileSize(file, maxSizeBytes)) {
        const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1)
        return {
            valid: false,
            error: `El archivo es muy grande. Tamaño máximo: ${maxSizeMB}MB`
        }
    }

    // 4. Validate magic numbers (most secure check)
    if (requireMagicNumber) {
        const magicResult = await validateFileTypeByMagicNumber(file, allowedTypes)
        if (!magicResult.valid) {
            return {
                valid: false,
                error: magicResult.error || 'Tipo de archivo no válido según firma del archivo'
            }
        }
    }

    return { valid: true }
}
