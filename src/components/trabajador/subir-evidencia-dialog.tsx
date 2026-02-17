'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { completeWorkerService, getServiceTasksWithPanosAction } from '@/actions/worker-services'
import { uploadImages, uploadVideos } from '@/lib/supabase/storage'
import { getEvidenceLimits } from '@/lib/constants/evidence-limits'
import { ImageUpload } from '@/components/ui/image-upload'
import { VideoUpload } from '@/components/ui/video-upload'
import { toast } from 'sonner'
import { Loader2, Wrench } from 'lucide-react'
import type { ServiceTask } from '@/types/database'

interface SubirEvidenciaDialogProps {
    serviceId: string
    workerRole: string
    onClose: () => void
}

interface TaskWithPanos {
    task: ServiceTask
    selected: boolean
}

export function SubirEvidenciaDialog({ serviceId, workerRole, onClose }: SubirEvidenciaDialogProps) {
    const [loading, setLoading] = useState(false)
    const [loadingService, setLoadingService] = useState(true)
    const [descripcion, setDescripcion] = useState('')
    const [images, setImages] = useState<string[]>([])
    const [imageFiles, setImageFiles] = useState<File[]>([])
    const [videos, setVideos] = useState<string[]>([])
    const [videoFiles, setVideoFiles] = useState<File[]>([])
    const [tasks, setTasks] = useState<TaskWithPanos[]>([])

    const isPanoRole = workerRole !== 'mecanico' && workerRole !== 'desabolladura'
    
    // Get evidence limits based on role
    const limits = getEvidenceLimits(workerRole)

    useEffect(() => {
        const loadServiceTasks = async () => {
            try {
                const result = await getServiceTasksWithPanosAction(serviceId)
                if (result.error) {
                    toast.error(result.error)
                } else {
                    setTasks(
                        result.tasks.map((task: ServiceTask) => ({
                            task,
                            selected: false,
                        }))
                    )
                }
            } catch (error) {
                console.error('Error loading service tasks:', error)
                toast.error('Error al cargar las tareas del servicio')
            } finally {
                setLoadingService(false)
            }
        }
        loadServiceTasks()
    }, [serviceId])

    const handleTaskToggle = (index: number) => {
        const newTasks = [...tasks]
        newTasks[index].selected = !newTasks[index].selected
        setTasks(newTasks)
    }

    const handleImageFilesChange = (imageUrls: string[]) => {
        // Extract files from blob URLs - we need to track files separately
        setImages(imageUrls)
        // Note: ImageUpload component handles file management internally
        // We'll extract files when submitting
    }

    const handleVideoFilesChange = (videoUrls: string[]) => {
        setVideos(videoUrls)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!descripcion.trim()) {
            toast.error('La descripción es requerida')
            return
        }

        // Para roles con paños, deben seleccionar al menos una tarea
        // Para otros roles (mecánico/desabolladura), no es necesario
        if (isPanoRole) {
            const selectedTasks = tasks.filter(t => t.selected)
            if (selectedTasks.length === 0) {
                toast.error('Debes seleccionar al menos una tarea completada')
                return
            }
        }

        setLoading(true)

        try {
            // Upload images if any
            let imageUrls: string[] = []
            if (images.length > 0) {
                // Convert blob URLs back to files for upload
                const imageFilesToUpload: File[] = []
                for (const imageUrl of images) {
                    try {
                        const response = await fetch(imageUrl)
                        const blob = await response.blob()
                        const fileName = `evidencia-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
                        const file = new File([blob], fileName, { type: 'image/jpeg' })
                        imageFilesToUpload.push(file)
                    } catch (error) {
                        console.error('Error converting image URL to file:', error)
                    }
                }
                
                if (imageFilesToUpload.length > 0) {
                    const uploadResult = await uploadImages(imageFilesToUpload, 'service-images', 'evidencia')
                    imageUrls = uploadResult.urls
                    if (uploadResult.errors.length > 0) {
                        toast.warning('Algunas imágenes no se pudieron subir')
                    }
                }
            }

            // Upload videos if any
            let videoUrls: string[] = []
            if (videos.length > 0) {
                // Convert blob URLs back to files for upload
                const videoFilesToUpload: File[] = []
                for (const videoUrl of videos) {
                    try {
                        const response = await fetch(videoUrl)
                        const blob = await response.blob()
                        const fileName = `evidencia-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
                        const file = new File([blob], fileName, { type: 'video/mp4' })
                        videoFilesToUpload.push(file)
                    } catch (error) {
                        console.error('Error converting video URL to file:', error)
                    }
                }
                
                if (videoFilesToUpload.length > 0) {
                    const uploadResult = await uploadVideos(videoFilesToUpload, 'service-images', 'evidencia')
                    videoUrls = uploadResult.urls
                    if (uploadResult.errors.length > 0) {
                        toast.warning('Algunos videos no se pudieron subir')
                    }
                }
            }

            // Prepare panos data - incluir TODAS las tareas seleccionadas
            // Las tareas sin paños se guardan con cantidad 0 para marcar que fueron asignadas
            const panosData = isPanoRole
                ? tasks
                      .filter(t => t.selected)
                      .map(t => ({
                          task_id: t.task.id,
                          cantidad: t.task.panos || 0, // Usar la cantidad de paños de la tarea (0 si no tiene)
                      }))
                : []

            // Complete the service
            const result = await completeWorkerService(serviceId, workerRole, {
                descripcion: descripcion.trim(),
                imagenes: imageUrls,
                videos: videoUrls,
                panos: panosData,
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Evidencia subida correctamente')
                onClose()
                // Refresh the page
                window.location.reload()
            }
        } catch (error) {
            console.error('Error submitting evidence:', error)
            toast.error('Error al subir la evidencia')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-white">Subir Evidencia</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Completa la información del trabajo realizado
                    </DialogDescription>
                </DialogHeader>

                {loadingService ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Descripción */}
                        <div className="space-y-2">
                            <Label htmlFor="descripcion" className="text-white">
                                Descripción <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                id="descripcion"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                placeholder="Describe el trabajo realizado..."
                                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                                required
                            />
                        </div>

                        {/* Tareas Realizadas (solo para roles que no son mecánico/desabolladura) */}
                        {isPanoRole && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-amber-400" />
                                    <Label className="text-white text-base font-semibold">
                                        Tareas Realizadas
                                    </Label>
                                </div>
                                {tasks.length > 0 ? (
                                    <>
                                        <div className="space-y-3 max-h-[300px] overflow-y-auto border border-zinc-800 rounded-lg p-4 bg-zinc-800/50">
                                            {tasks.map((taskWithPanos, index) => (
                                                <div
                                                    key={taskWithPanos.task.id}
                                                    className="flex items-center gap-3 p-3 rounded-lg border border-zinc-700 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={taskWithPanos.selected}
                                                        onCheckedChange={() => handleTaskToggle(index)}
                                                        className="border-zinc-600"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium">
                                                            {taskWithPanos.task.descripcion}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {(taskWithPanos.task.panos || 0) > 0 ? (
                                                                <span className="text-xs text-amber-400 font-medium">
                                                                    {taskWithPanos.task.panos || 0} paños
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-zinc-500">
                                                                    Sin paños
                                                                </span>
                                                            )}
                                                            {taskWithPanos.task.costo_mano_obra && (
                                                                <>
                                                                    <span className="text-xs text-zinc-500">•</span>
                                                                    <span className="text-xs text-zinc-400">
                                                                        ${taskWithPanos.task.costo_mano_obra.toLocaleString('es-CL')}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-zinc-500">
                                            Selecciona las tareas que completaste. Los paños se asignarán automáticamente solo para las tareas que los tengan.
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-zinc-500 text-center py-4 border border-zinc-800 rounded-lg bg-zinc-800/50">
                                        No hay tareas disponibles en este servicio
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Imágenes */}
                        <div className="space-y-2">
                            <Label className="text-white">
                                Fotos (Opcional) - {images.length}/{limits.maxImages}
                            </Label>
                            <ImageUpload
                                images={images}
                                onImagesChange={setImages}
                                maxImages={limits.maxImages}
                                disabled={loading}
                            />
                        </div>

                        {/* Videos */}
                        <div className="space-y-2">
                            <Label className="text-white">
                                Videos (Opcional) - {videos.length}/{limits.maxVideos}
                            </Label>
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
                                className="border-zinc-700 text-zinc-400 hover:text-white"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Subiendo...
                                    </>
                                ) : (
                                    'Subir Evidencia'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

