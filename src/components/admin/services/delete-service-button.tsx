'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { deleteService } from '@/actions/services'
import { toast } from 'sonner'

interface DeleteServiceButtonProps {
    serviceId: string
    serviceNumber: number
}

export function DeleteServiceButton({ serviceId, serviceNumber }: DeleteServiceButtonProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleDelete() {
        startTransition(async () => {
            try {
                await deleteService(serviceId)
            } catch (error) {
                // Redirect throws an error, which is expected
                if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
                    return
                }
                toast.error('Error al eliminar el servicio')
                console.error('Error deleting service:', error)
            }
        })
    }

    return (
        <>
            <Button
                variant="outline"
                className="w-full justify-start border-red-700/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Eliminando...
                    </>
                ) : (
                    <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Servicio
                    </>
                )}
            </Button>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                                <AlertTriangle className="h-6 w-6 text-red-500" />
                            </div>
                            <div>
                                <AlertDialogTitle className="text-white">
                                    ¿Eliminar servicio #{serviceNumber}?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                    Esta acción no se puede deshacer
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                        <p className="text-sm text-zinc-300">
                            Se eliminarán permanentemente:
                        </p>
                        <ul className="space-y-1 text-sm text-zinc-400 list-disc list-inside">
                            <li>Todas las tareas asociadas</li>
                            <li>Todos los repuestos utilizados</li>
                            <li>Todos los gastos adicionales</li>
                            <li>Todas las comisiones</li>
                            <li>Toda la evidencia fotográfica</li>
                        </ul>
                        <p className="text-sm text-red-400 mt-4 font-medium">
                            Esta acción es irreversible
                        </p>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Eliminando...
                                </>
                            ) : (
                                'Sí, eliminar servicio'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
