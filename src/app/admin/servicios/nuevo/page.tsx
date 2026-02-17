import { AdminHeader } from '@/components/admin/admin-header'
import { NuevoServicioForm } from '@/components/admin/services/nuevo-servicio-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NuevoServicioPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Nuevo Servicio" />

            <div className="flex-1 p-6 pb-24 space-y-6">
                {/* Back button */}
                <div className="flex items-center gap-4">
                    <Link href="/admin/servicios">
                        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver a Servicios
                        </Button>
                    </Link>
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-white">Crear Nuevo Servicio</h2>
                    <p className="text-zinc-400 mt-1">
                        Registra un nuevo servicio de reparación
                    </p>
                </div>

                <NuevoServicioForm />
            </div>
        </div>
    )
}
