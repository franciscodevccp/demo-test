'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { XCircle, Loader2 } from 'lucide-react'
import { rejectQualityReport } from '@/actions/quality-reports'
import { toast } from 'sonner'

interface RejectQualityReportButtonProps {
    reportId: string
}

export function RejectQualityReportButton({ reportId }: RejectQualityReportButtonProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [razonRechazo, setRazonRechazo] = useState('')
    const [isPending, startTransition] = useTransition()

    const handleReject = () => {
        if (!razonRechazo.trim()) {
            toast.error('Debe ingresar una razón para el rechazo')
            return
        }

        startTransition(async () => {
            const result = await rejectQualityReport(reportId, razonRechazo)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Informe de calidad rechazado correctamente')
                setIsOpen(false)
                setRazonRechazo('')
                router.refresh()
            }
        })
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant="outline"
                className="border-red-600 text-red-400 hover:bg-red-600/10"
            >
                <XCircle className="h-4 w-4 mr-2" />
                Rechazar
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Rechazar Informe de Calidad</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Por favor, ingrese la razón del rechazo. Esta información será visible para el trabajador.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="razonRechazo" className="text-zinc-300">
                                Razón del Rechazo *
                            </Label>
                            <Textarea
                                id="razonRechazo"
                                value={razonRechazo}
                                onChange={(e) => setRazonRechazo(e.target.value)}
                                placeholder="Ej: Trabajo incompleto, falta de evidencia, calidad insuficiente..."
                                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsOpen(false)
                                setRazonRechazo('')
                            }}
                            disabled={isPending}
                            className="border-zinc-700"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleReject}
                            disabled={isPending || !razonRechazo.trim()}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Rechazando...
                                </>
                            ) : (
                                <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rechazar
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

