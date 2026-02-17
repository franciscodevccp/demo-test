import { AdminHeader } from '@/components/admin/admin-header'
import { getWorkerById } from '@/services/workers'
import { notFound } from 'next/navigation'
import { isValidUUID } from '@/lib/utils/validation'
import { EditarTrabajadorForm } from '@/components/admin/workers/editar-trabajador-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft, UserCog } from 'lucide-react'
import Link from 'next/link'

interface EditarTrabajadorPageProps {
    params: Promise<{ id: string }>
}

export default async function EditarTrabajadorPage({ params }: EditarTrabajadorPageProps) {
    const { id } = await params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
        notFound()
    }
    
    const worker = await getWorkerById(id)

    if (!worker) {
        notFound()
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Editar Trabajador" />

            <div className="flex-1 p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/trabajadores">
                        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <UserCog className="h-7 w-7 text-cyan-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Editar Trabajador</h2>
                        <p className="text-zinc-400 mt-1">
                            Modifica la información del trabajador
                        </p>
                    </div>
                </div>

                <EditarTrabajadorForm worker={worker} />
            </div>
        </div>
    )
}
