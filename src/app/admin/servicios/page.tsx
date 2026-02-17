import { AdminHeader } from '@/components/admin/admin-header'
import { getServices, getServicesCount } from '@/services/services'
import { ServicesListRealtime } from '@/components/admin/services/services-list-realtime'
import { ServicesFilters } from '@/components/admin/services/services-filters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Wrench, Plus, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import type { ServiceStatus } from '@/types/database'

interface ServiciosPageProps {
    searchParams: Promise<{ estado?: string; buscar?: string }>
}

export default async function ServiciosPage({ searchParams }: ServiciosPageProps) {
    const params = await searchParams
    const status = (params.estado as ServiceStatus | 'all') || 'all'
    const search = params.buscar || ''

    const [services, counts] = await Promise.all([
        getServices(status),
        getServicesCount()
    ])

    // Filter by search term if provided
    const filteredServices = search
        ? services.filter(s =>
            s.vehicle?.patente?.toLowerCase().includes(search.toLowerCase()) ||
            s.customer?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
            s.numero_servicio.toString().includes(search)
        )
        : services

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Servicios" />

            <div className="flex-1 p-6 space-y-6">
                {/* Header with action */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Wrench className="h-7 w-7 text-blue-400" />
                            Gestión de Servicios
                        </h2>
                        <p className="text-zinc-400 mt-1">
                            Administra los servicios de reparación del taller
                        </p>
                    </div>
                    <Link href="/admin/servicios/nuevo">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Servicio
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Total</CardDescription>
                            <CardTitle className="text-2xl text-white">{counts.total}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-amber-400" />
                                Pendientes
                            </CardDescription>
                            <CardTitle className="text-2xl text-amber-400">{counts.pending}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-400" />
                                En Proceso
                            </CardDescription>
                            <CardTitle className="text-2xl text-blue-400">{counts.inProgress}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                Completados
                            </CardDescription>
                            <CardTitle className="text-2xl text-green-400">{counts.completed}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <ServicesFilters currentStatus={status} currentSearch={search} />

                {/* Services List */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">
                            {status === 'all' ? 'Todos los Servicios' :
                                status === 'pendiente' ? 'Servicios Pendientes' :
                                    status === 'en_proceso' ? 'Servicios En Proceso' :
                                        status === 'completado' ? 'Servicios Completados' :
                                            'Servicios Cancelados'}
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            {filteredServices.length} {filteredServices.length === 1 ? 'servicio encontrado' : 'servicios encontrados'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ServicesListRealtime initialServices={filteredServices} status={status} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
