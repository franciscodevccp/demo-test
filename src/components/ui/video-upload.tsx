'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Card } from './card'
import { X, Upload, Video as VideoIcon } from 'lucide-react'
import { toast } from 'sonner'
import { validateFile } from '@/lib/utils/file-validation'

interface VideoUploadProps {
    videos: string[]
    onVideosChange: (videos: string[]) => void
    maxVideos?: number
    disabled?: boolean
}

export function VideoUpload({
    videos,
    onVideosChange,
    maxVideos = 3,
    disabled = false
}: VideoUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Check max videos limit
        if (videos.length + files.length > maxVideos) {
            toast.error(`Máximo ${maxVideos} videos permitidos`)
            return
        }

        // Validate file types, magic numbers, extensions, and sizes
        const validFiles: File[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            
            // Comprehensive validation with magic numbers
            const validation = await validateFile(file, {
                allowedTypes: ['video/mp4', 'video/webm', 'video/quicktime'],
                allowedExtensions: ['mp4', 'webm', 'mov', 'avi'],
                maxSizeBytes: 50 * 1024 * 1024, // 50MB
                requireMagicNumber: true
            })

            if (!validation.valid) {
                toast.error(`${file.name}: ${validation.error}`)
                continue
            }

            validFiles.push(file)
        }

        if (validFiles.length === 0) return

        setIsUploading(true)

        try {
            // Create preview URLs
            const newVideoUrls = validFiles.map(file => URL.createObjectURL(file))
            onVideosChange([...videos, ...newVideoUrls])
            
            toast.success(`${validFiles.length} video(s) agregado(s)`)
        } catch (error) {
            console.error('Error processing videos:', error)
            toast.error('Error al procesar los videos')
        } finally {
            setIsUploading(false)
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveVideo = (index: number) => {
        const newVideos = videos.filter((_, i) => i !== index)
        onVideosChange(newVideos)
        toast.success('Video eliminado')
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="space-y-4">
            {/* Video Grid */}
            {videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {videos.map((video, index) => (
                        <Card
                            key={index}
                            className="relative group overflow-hidden border-zinc-800 bg-zinc-900/50 p-2"
                        >
                            <div className="aspect-video relative rounded-md overflow-hidden bg-zinc-800">
                                <video
                                    src={video}
                                    className="w-full h-full object-cover"
                                    controls
                                />
                                <div className="absolute top-2 right-2 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveVideo(index)}
                                        disabled={disabled}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-1 text-center">
                                <span className="text-xs text-zinc-500">
                                    Video {index + 1} de {videos.length}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {videos.length < maxVideos && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={disabled || isUploading}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleButtonClick}
                        disabled={disabled || isUploading}
                        className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 border-dashed"
                    >
                        {isUploading ? (
                            <>
                                <Upload className="h-4 w-4 mr-2 animate-pulse" />
                                Procesando...
                            </>
                        ) : (
                            <>
                                <VideoIcon className="h-4 w-4 mr-2" />
                                Seleccionar Videos ({videos.length}/{maxVideos})
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-zinc-500 mt-2 text-center">
                        Máximo {maxVideos} videos • Hasta 50MB por video • MP4, MOV, AVI, WEBM
                    </p>
                </div>
            )}

            {/* Empty State */}
            {videos.length === 0 && (
                <div className="text-center py-8 border border-dashed border-zinc-700 rounded-lg bg-zinc-900/30">
                    <VideoIcon className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">
                        No hay videos cargados
                    </p>
                </div>
            )}
        </div>
    )
}

