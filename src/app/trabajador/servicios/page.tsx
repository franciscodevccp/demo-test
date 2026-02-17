import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { getAvailableServicesForWorker } from '@/services/worker-services'
import { MobileMenuButton } from '@/components/trabajador/mobile-menu-button'
import { ServicesListRealtime } from '@/components/trabajador/services-list-realtime'
import { Wrench } from 'lucide-react'

export default async function ServiciosDisponiblesPage() {
    const user = await getUser()

    if (!user) {
        redirect('/')
    }

    // Get available services for this worker
    const services = await getAvailableServicesForWorker(user.id, user.rol)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MobileMenuButton />
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Wrench className="h-7 w-7 text-red-500" />
                            Servicios Disponibles
                        </h1>
                        <p className="mt-1 text-zinc-400">
                            Trabajos que puedes tomar
                        </p>
                    </div>
                </div>
            </div>

            {/* Services List */}
            <ServicesListRealtime initialServices={services} workerId={user.id} workerRole={user.rol} />
        </div>
    )
}

