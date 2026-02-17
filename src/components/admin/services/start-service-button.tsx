'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Clock, Loader2 } from 'lucide-react'
import { startService } from '@/actions/services'
import { toast } from 'sonner'

interface StartServiceButtonProps {
    serviceId: string
}

export function StartServiceButton({ serviceId }: StartServiceButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleStart = () => {
        startTransition(async () => {
            const result = await startService(serviceId)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Servicio iniciado correctamente')
                router.refresh()
            }
        })
    }

    return (
        <Button
            onClick={handleStart}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 text-white"
        >
            {isPending ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Iniciando...
                </>
            ) : (
                <>
                    <Clock className="h-4 w-4 mr-2" />
                    Iniciar Trabajo
                </>
            )}
        </Button>
    )
}

