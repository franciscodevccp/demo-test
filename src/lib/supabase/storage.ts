
/**
 * Upload an image to Supabase Storage
 */
export async function uploadImages(files: File[], bucket: string, folder: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`Mock Upload Images to ${bucket}/${folder}:`, files.map(f => f.name))

    return files.map((file, index) => {
        // Return a dummy placeholder image
        return `https://placehold.co/600x400?text=${encodeURIComponent(file.name)}`
    })
}

/**
 * Upload a video to Supabase Storage
 */
export async function uploadVideos(files: File[], bucket: string, folder: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`Mock Upload Videos to ${bucket}/${folder}:`, files.map(f => f.name))

    return files.map((file, index) => {
        // Return a dummy video placeholder (or just null/string)
        return `https://example.com/mock-video-${index}.mp4`
    })
}

/**
 * Delete an image from Supabase Storage
 */
export async function deleteImage(url: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`Mock Delete Image: ${url}`)
    return true
}

export async function uploadMultipleImages(files: File[], bucket: string, folder: string) {
    return uploadImages(files, bucket, folder)
}

export async function uploadMultipleVideos(files: File[], bucket: string, folder: string) {
    return uploadVideos(files, bucket, folder)
}
