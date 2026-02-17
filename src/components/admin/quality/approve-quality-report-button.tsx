'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { approveQualityReport } from '@/actions/quality-reports'
import { toast } from 'sonner'

interface ApproveQualityReportButtonProps {
    reportId: string
}

export function ApproveQualityReportButton({ reportId }: ApproveQualityReportButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveQualityReport(reportId)
            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success('Informe de calidad aprobado correctamente')
                router.refresh()
            }
        })
    }

    return (
        <Button
            onClick={handleApprove}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700 text-white"
        >
            {isPending ? (
                <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Aprobando...
                </>
            ) : (
                <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aprobar
                </>
            )}
        </Button>
    )
}

