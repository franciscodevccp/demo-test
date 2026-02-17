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
import { deleteCustomer } from '@/actions/customers'
import { toast } from 'sonner'

interface DeleteCustomerButtonProps {
    customerId: string
    customerName: string
    vehicleCount: number
}

export function DeleteCustomerButton({ customerId, customerName, vehicleCount }: DeleteCustomerButtonProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleDelete() {
        startTransition(async () => {
            try {
                const result = await deleteCustomer(customerId)
                if (result?.error) {
                    toast.error(result.error)
                    return
                }
            } catch (error) {
                // Redirect throws an error, which is expected
                if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
                    return
                }
                toast.error('Error al eliminar el cliente')
                console.error('Error deleting customer:', error)
            }
        })
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="border-red-700/50 text-red-400 hover:bg-red-950/30 hover:text-red-300"
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
                        Eliminar
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
                                    ¿Eliminar cliente "{customerName}"?
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
                            <li>El cliente y toda su información personal</li>
                            {vehicleCount > 0 && (
                                <li>{vehicleCount} vehículo(s) asociado(s) (si no tienen servicios)</li>
                            )}
                        </ul>
                        <p className="text-sm text-amber-400 mt-4 font-medium">
                            ⚠️ No se puede eliminar si el cliente tiene servicios asociados
                        </p>
                        <p className="text-sm text-red-400 mt-2 font-medium">
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
                                'Sí, eliminar cliente'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
