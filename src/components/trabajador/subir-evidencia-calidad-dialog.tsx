'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { submitQualityEvidence } from '@/actions/quality-reports'
import { uploadImages, uploadVideos } from '@/lib/supabase/storage'
import { getEvidenceLimits } from '@/lib/constants/evidence-limits'
import { ImageUpload } from '@/components/ui/image-upload'
import { VideoUpload } from '@/components/ui/video-upload'
import { toast } from 'sonner'
import { Loader2, Upload, FileCheck, X, Plus } from 'lucide-react'

interface SubirEvidenciaCalidadDialogProps {
    serviceId: string
    workerId: string
    onClose: () => void
}

export function SubirEvidenciaCalidadDialog({ serviceId, workerId, onClose }: SubirEvidenciaCalidadDialogProps) {
    const [loading, setLoading] = useState(false)
    const [descripcion, setDescripcion] = useState('')
    const [fallas, setFallas] = useState<string[]>([''])
    const [images, setImages] = useState<string[]>([])
    const [videos, setVideos] = useState<string[]>([])

    // Get evidence limits - calidad role uses standard limits (15 images, 3 videos)
    const limits = getEvidenceLimits('calidad')

    const handleAddFalla = () => {
        setFallas([...fallas, ''])
    }

    const handleRemoveFalla = (index: number) => {
        const newFallas = fallas.filter((_, i) => i !== index)
        setFallas(newFallas.length > 0 ? newFallas : [''])
    }

    const handleFallaChange = (index: number, value: string) => {
        const newFallas = [...fallas]
        newFallas[index] = value
        setFallas(newFallas)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!descripcion.trim()) {
            toast.error('La descripción es requerida')
            return
        }

        // Filtrar fallas vacías
        const fallasValidas = fallas.filter(f => f.trim().length > 0)
        
        if (fallasValidas.length === 0) {
            toast.error('Debe agregar al menos una falla encontrada')
            return
        }

        setLoading(true)

        try {
            let imageUrls: string[] = []
            let videoUrls: string[] = []

            // Subir imágenes si hay
            if (images.length > 0) {
                // Convert blob URLs back to files for upload
                const imageFilesToUpload: File[] = []
                for (const imageUrl of images) {
                    try {
                        const response = await fetch(imageUrl)
                        const blob = await response.blob()
                        const fileName = `calidad-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
                        const file = new File([blob], fileName, { type: 'image/jpeg' })
                        imageFilesToUpload.push(file)
                    } catch (error) {
                        console.error('Error converting image URL to file:', error)
                    }
                }
                
                if (imageFilesToUpload.length > 0) {
                    const uploadResult = await uploadImages(
                        imageFilesToUpload,
                        'quality-reports',
                        serviceId
                    )

                    imageUrls = uploadResult.urls || []
                    
                    if (uploadResult.errors.length > 0) {
                        toast.warning('Algunas imágenes no se pudieron subir')
                    }
                }
            }

            // Subir videos si hay
            if (videos.length > 0) {
                // Convert blob URLs back to files for upload
                const videoFilesToUpload: File[] = []
                for (const videoUrl of videos) {
                    try {
                        const response = await fetch(videoUrl)
                        const blob = await response.blob()
                        const fileName = `calidad-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
                        const file = new File([blob], fileName, { type: 'video/mp4' })
                        videoFilesToUpload.push(file)
                    } catch (error) {
                        console.error('Error converting video URL to file:', error)
                    }
                }
                
                if (videoFilesToUpload.length > 0) {
                    const uploadResult = await uploadVideos(
                        videoFilesToUpload,
                        'quality-reports',
                        serviceId
                    )

                    videoUrls = uploadResult.urls || []
                    
                    if (uploadResult.errors.length > 0) {
                        toast.warning('Algunos videos no se pudieron subir')
                    }
                }
            }

            // Enviar evidencia con descripción, fallas, imágenes y videos
            const result = await submitQualityEvidence({
                serviceId,
                workerId,
                descripcion: descripcion.trim(),
                fallas: fallasValidas,
                imagenes: imageUrls,
                videos: videoUrls,
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Evidencia enviada correctamente. El servicio quedó pendiente de revisión.')
                onClose()
                // Recargar la página para actualizar la lista
                window.location.reload()
            }
        } catch (error) {
            console.error('Error submitting quality evidence:', error)
            toast.error('Error al enviar la evidencia')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Subir Evidencia de Control de Calidad
                    </DialogTitle>
                    <DialogDescription>
                        Sube evidencia y registra las fallas encontradas en el servicio
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Descripción */}
                    <div className="space-y-2">
                        <Label htmlFor="descripcion">Descripción *</Label>
                        <Textarea
                            id="descripcion"
                            placeholder="Describe el estado general del servicio y el trabajo realizado..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows={4}
                            className="resize-none"
                            required
                        />
                    </div>

                    {/* Lista de Fallas */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Fallas Encontradas *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleAddFalla}
                                className="h-8"
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar Falla
                            </Button>
                        </div>
                        <div className="space-y-2">
                            {fallas.map((falla, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        placeholder={`Falla #${index + 1}`}
                                        value={falla}
                                        onChange={(e) => handleFallaChange(index, e.target.value)}
                                    />
                                    {fallas.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFalla(index)}
                                            className="h-9 w-9 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-zinc-500">
                            Agrega todas las fallas que encuentres durante la inspección de calidad
                        </p>
                    </div>

                    {/* Imágenes */}
                    <div className="space-y-2">
                        <Label>Evidencia Fotográfica (Opcional) - {images.length}/{limits.maxImages}</Label>
                        <ImageUpload
                            images={images}
                            onImagesChange={setImages}
                            maxImages={limits.maxImages}
                            disabled={loading}
                        />
                    </div>

                    {/* Videos */}
                    <div className="space-y-2">
                        <Label>Videos (Opcional) - {videos.length}/{limits.maxVideos}</Label>
                        <VideoUpload
                            videos={videos}
                            onVideosChange={setVideos}
                            maxVideos={limits.maxVideos}
                            disabled={loading}
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Enviar Evidencia
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

