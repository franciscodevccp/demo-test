import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { getWorkerCommissions } from '@/services/worker-commissions'
import { MobileMenuButton } from '@/components/trabajador/mobile-menu-button'
import { WorkerCommissionsList } from '@/components/trabajador/worker-commissions-list'
import { DollarSign } from 'lucide-react'

export default async function MisComisionesPage() {
    const user = await getUser()

    if (!user) {
        redirect('/')
    }

    // Only allow mechanics and desabolladura workers
    if (user.rol !== 'mecanico' && user.rol !== 'desabolladura') {
        redirect('/trabajador')
    }

    // Get worker's commissions with details
    const commissions = await getWorkerCommissions(user.id)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MobileMenuButton />
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <DollarSign className="h-7 w-7 text-red-500" />
                            Mis Comisiones
                        </h1>
                        <p className="mt-1 text-zinc-400">
                            Registro de comisiones por servicios completados
                        </p>
                    </div>
                </div>
            </div>

            {/* Commissions List */}
            <WorkerCommissionsList commissions={commissions} />
        </div>
    )
}

