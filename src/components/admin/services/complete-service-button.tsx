'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { completeService } from '@/actions/services'
import { toast } from 'sonner'

interface CompleteServiceButtonProps {
    serviceId: string
}

export function CompleteServiceButton({ serviceId }: CompleteServiceButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleComplete = () => {
        startTransition(async () => {
            const result = await completeService(serviceId)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Servicio completado correctamente')
                router.refresh()
            }
        })
    }

    return (
        <Button
            onClick={handleComplete}
            disabled={isPending}
            className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
        >
            {isPending ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completando...
                </>
            ) : (
                <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completar Servicio
                </>
            )}
        </Button>
    )
}

