import { AdminHeader } from '@/components/admin/admin-header'
import { getServiceById } from '@/services/services'
import { notFound } from 'next/navigation'
import { isValidUUID } from '@/lib/utils/validation'
import { EditarServicioForm } from '@/components/admin/services/editar-servicio-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditarServicioPageProps {
    params: Promise<{ id: string }>
}

export default async function EditarServicioPage({ params }: EditarServicioPageProps) {
    const { id } = await params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
        notFound()
    }
    
    const service = await getServiceById(id)

    if (!service) {
        notFound()
    }

    // Only allow editing if service is pendiente or en_proceso
    if (service.estado !== 'pendiente' && service.estado !== 'en_proceso') {
        return (
            <div className="flex flex-col min-h-screen">
                <AdminHeader title="Editar Servicio" />
                <div className="flex-1 p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/admin/servicios/${id}`}>
                            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                    </div>
                    <div className="max-w-2xl mx-auto text-center py-12">
                        <h2 className="text-2xl font-bold text-white mb-4">No se puede editar este servicio</h2>
                        <p className="text-zinc-400">
                            Solo se pueden editar servicios en estado <span className="text-amber-400">Pendiente</span> o <span className="text-blue-400">En Proceso</span>
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const vehicle = Array.isArray(service.vehicle) ? service.vehicle[0] : service.vehicle
    const customer = Array.isArray(service.customer) ? service.customer[0] : service.customer

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title={`Editar Servicio #${service.numero_servicio}`} />

            <div className="flex-1 p-6 space-y-6 pb-24">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/servicios/${id}`}>
                        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a Detalles
                        </Button>
                    </Link>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white">Editar Servicio</h2>
                    <p className="text-zinc-400 mt-1">
                        Modifica los detalles del servicio de reparación
                    </p>
                </div>

                <EditarServicioForm 
                    serviceId={id}
                    service={service}
                    vehicle={vehicle}
                    customer={customer}
                />
            </div>
        </div>
    )
}

