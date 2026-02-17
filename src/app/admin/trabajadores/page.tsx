import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserCog, Phone, Calendar, CheckCircle2, XCircle, Edit, Plus } from 'lucide-react'
import { getWorkers } from '@/services/workers'
import { WorkersFilters } from '@/components/admin/workers/workers-filters'
import { DeleteWorkerButton } from '@/components/admin/workers/delete-worker-button'
import Link from 'next/link'
import type { UserRole } from '@/types/database'

function formatDate(dateString: string) {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date)
}

function formatRole(rol: UserRole): string {
    const roles: Partial<Record<UserRole, string>> = {
        admin: 'Administrador',
        mecanico: 'Mecánico',
        pintor: 'Pintor',
        desabolladura: 'Desabolladura',
        preparacion: 'Preparación',
        armado: 'Armado',
        lavado: 'Lavado',
        pulido: 'Pulido',
        sistema_calidad: 'Sistema de Calidad',
    }
    return roles[rol] || rol
}

interface TrabajadoresPageProps {
    searchParams: Promise<{ orden?: string; buscar?: string }>
}

export default async function TrabajadoresPage({ searchParams }: TrabajadoresPageProps) {
    const params = await searchParams
    const orderBy = (params.orden === 'antiguos' ? 'antiguos' : 'recientes') as 'recientes' | 'antiguos'
    const search = params.buscar || ''

    const workers = await getWorkers(orderBy)

    // Filter by nombre if search term is provided
    const filteredWorkers = search
        ? workers.filter(worker =>
            worker.nombre.toLowerCase().includes(search.toLowerCase())
        )
        : workers

    const activeWorkers = filteredWorkers.filter(w => w.activo).length
    const inactiveWorkers = filteredWorkers.filter(w => !w.activo).length

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Trabajadores" />

            <div className="flex-1 p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <UserCog className="h-7 w-7 text-cyan-400" />
                            Gestión de Trabajadores
                        </h2>
                        <p className="text-zinc-400 mt-1">
                            Información del equipo del taller
                        </p>
                    </div>
                    <Link href="/admin/trabajadores/nuevo">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Trabajador
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Total Trabajadores</CardDescription>
                            <CardTitle className="text-2xl text-white">{filteredWorkers.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                Trabajadores Activos
                            </CardDescription>
                            <CardTitle className="text-2xl text-green-400">
                                {activeWorkers}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400 flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-zinc-500" />
                                Trabajadores Inactivos
                            </CardDescription>
                            <CardTitle className="text-2xl text-zinc-500">
                                {inactiveWorkers}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <WorkersFilters currentSort={orderBy} currentSearch={search} />

                {/* Workers List */}
                {filteredWorkers.length === 0 ? (
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardContent className="p-12">
                            <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 p-12 text-center">
                                <UserCog className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-500">
                                    No hay trabajadores registrados
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {filteredWorkers.map((worker) => (
                            <Card key={worker.id} className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-full text-white font-semibold text-lg ${worker.activo ? 'bg-cyan-600' : 'bg-zinc-600'}`}>
                                                {worker.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl text-white flex items-center gap-2">
                                                    {worker.nombre}
                                                    {!worker.activo && (
                                                        <Badge variant="secondary" className="bg-zinc-700 text-zinc-300 text-xs">
                                                            Inactivo
                                                        </Badge>
                                                    )}
                                                </CardTitle>
                                                <CardDescription className="text-zinc-400 capitalize">
                                                    {formatRole(worker.rol)}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <div className="text-xs text-zinc-500">
                                            <Calendar className="h-3 w-3 inline mr-1" />
                                            Registrado: {formatDate(worker.created_at)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-3">
                                            {worker.telefono && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Phone className="h-4 w-4 text-zinc-500" />
                                                    <span className="text-zinc-300">{worker.telefono}</span>
                                                </div>
                                            )}
                                            {!worker.telefono && (
                                                <p className="text-sm text-zinc-500">No hay información adicional</p>
                                            )}
                                        </div>
                                        <div className="pt-2 border-t border-zinc-800 flex gap-2">
                                            <Link href={`/admin/trabajadores/${worker.id}/editar`} className="flex-1">
                                                <Button variant="outline" size="sm" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Editar
                                                </Button>
                                            </Link>
                                            <DeleteWorkerButton workerId={worker.id} workerName={worker.nombre} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
