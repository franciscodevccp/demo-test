'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { startQualityControl } from '@/actions/quality-reports'
import { toast } from 'sonner'
import { Loader2, FileCheck } from 'lucide-react'

interface IniciarControlCalidadDialogProps {
    serviceId: string
    workerId: string
    onClose: () => void
}

export function IniciarControlCalidadDialog({ serviceId, workerId, onClose }: IniciarControlCalidadDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        setLoading(true)

        try {
            const result = await startQualityControl(serviceId, workerId)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Control de calidad iniciado correctamente')
                onClose()
                // Recargar la página para actualizar la lista
                window.location.reload()
            }
        } catch (error) {
            console.error('Error starting quality control:', error)
            toast.error('Error al iniciar el control de calidad')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5" />
                        Iniciar Control de Calidad
                    </DialogTitle>
                    <DialogDescription>
                        El servicio cambiará a "En Proceso". Podrás subir la evidencia y registrar las fallas después.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="text-center py-4">
                        <p className="text-zinc-300">
                            ¿Deseas iniciar el control de calidad para este servicio?
                        </p>
                        <p className="text-sm text-zinc-500 mt-2">
                            Una vez iniciado, podrás subir la evidencia y registrar las fallas encontradas.
                        </p>
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
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <FileCheck className="h-4 w-4 mr-2" />
                                    Iniciar Control de Calidad
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

