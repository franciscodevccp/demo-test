import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { getWorkerPanosWithDetails } from '@/services/worker-services'
import { MobileMenuButton } from '@/components/trabajador/mobile-menu-button'
import { WorkerPanosList } from '@/components/trabajador/worker-panos-list'
import { Package } from 'lucide-react'

export default async function MisPanosPage() {
    const user = await getUser()

    if (!user) {
        redirect('/')
    }

    // Get worker's panos with details
    const panos = await getWorkerPanosWithDetails(user.id)

    // Calculate total
    const totalPanos = panos.reduce((sum, pano) => sum + (pano.cantidad_panos || 0), 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MobileMenuButton />
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Package className="h-7 w-7 text-red-500" />
                            Mis Paños
                        </h1>
                        <p className="mt-1 text-zinc-400">
                            Registro de paños obtenidos por tarea
                        </p>
                    </div>
                </div>
            </div>

            {/* Total Summary */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="text-sm text-zinc-400">Total de Paños</div>
                    <div className="text-2xl font-bold text-amber-400 mt-1">
                        {totalPanos}
                    </div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="text-sm text-zinc-400">Tareas Completadas</div>
                    <div className="text-2xl font-bold text-white mt-1">
                        {panos.length}
                    </div>
                </div>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="text-sm text-zinc-400">Servicios</div>
                    <div className="text-2xl font-bold text-white mt-1">
                        {new Set(panos.map(p => p.service_id)).size}
                    </div>
                </div>
            </div>

            {/* Panos List */}
            <WorkerPanosList panos={panos} />
        </div>
    )
}

