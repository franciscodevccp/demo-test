'use client'

import { useState, useRef } from 'react'
import { Button } from './button'
import { Card } from './card'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { validateFile } from '@/lib/utils/file-validation'

interface ImageUploadProps {
    images: string[]
    onImagesChange: (images: string[]) => void
    maxImages?: number
    disabled?: boolean
}

export function ImageUpload({
    images,
    onImagesChange,
    maxImages = 10,
    disabled = false
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Check max images limit
        if (images.length + files.length > maxImages) {
            toast.error(`Máximo ${maxImages} imágenes permitidas`)
            return
        }

        // Validate file types, magic numbers, extensions, and sizes
        const validFiles: File[] = []
        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            
            // Comprehensive validation with magic numbers
            const validation = await validateFile(file, {
                allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                maxSizeBytes: 5 * 1024 * 1024, // 5MB
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
            const newImageUrls = validFiles.map(file => URL.createObjectURL(file))
            onImagesChange([...images, ...newImageUrls])
            
            toast.success(`${validFiles.length} imagen(es) agregada(s)`)
        } catch (error) {
            console.error('Error processing images:', error)
            toast.error('Error al procesar las imágenes')
        } finally {
            setIsUploading(false)
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    const handleRemoveImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index)
        onImagesChange(newImages)
        toast.success('Imagen eliminada')
    }

    const handleButtonClick = () => {
        fileInputRef.current?.click()
    }

    return (
        <div className="space-y-4">
            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {images.map((image, index) => (
                        <Card
                            key={index}
                            className="relative group overflow-hidden border-zinc-800 bg-zinc-900/50 p-2"
                        >
                            <div className="aspect-square relative rounded-md overflow-hidden bg-zinc-800">
                                <img
                                    src={image}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleRemoveImage(index)}
                                        disabled={disabled}
                                        className="h-8 w-8 p-0"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-1 text-center">
                                <span className="text-xs text-zinc-500">
                                    {index + 1} de {images.length}
                                </span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Button */}
            {images.length < maxImages && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
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
                                <ImageIcon className="h-4 w-4 mr-2" />
                                Seleccionar Imágenes ({images.length}/{maxImages})
                            </>
                        )}
                    </Button>
                    <p className="text-xs text-zinc-500 mt-2 text-center">
                        Máximo {maxImages} fotos • Hasta 5MB por imagen • JPG, PNG, WEBP
                    </p>
                </div>
            )}

            {/* Empty State */}
            {images.length === 0 && (
                <div className="text-center py-8 border border-dashed border-zinc-700 rounded-lg bg-zinc-900/30">
                    <ImageIcon className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                    <p className="text-sm text-zinc-500">
                        No hay imágenes cargadas
                    </p>
                </div>
            )}
        </div>
    )
}

