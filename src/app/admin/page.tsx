import { getUser } from '@/actions/auth'
import { getDashboardStats, getRecentServices } from '@/services/dashboard'
import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Wrench,
    Clock,
    CheckCircle2,
    DollarSign,
    AlertTriangle,
    Users,
    Car,
    UserCog,
    TrendingUp,
} from 'lucide-react'
import Link from 'next/link'

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

function getStatusBadge(status: string) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        pendiente: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        en_proceso: { label: 'En Proceso', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        completado: { label: 'Completado', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
        cancelado: { label: 'Cancelado', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    }
    const config = statusConfig[status] || { label: status, className: 'bg-zinc-500/10 text-zinc-500' }
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}

export default async function AdminDashboard() {
    const user = await getUser()
    const stats = await getDashboardStats()
    const recentServices = await getRecentServices(5)

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Dashboard" />

            <div className="flex-1 p-6 space-y-6">
                {/* Welcome */}
                <div>
                    <h2 className="text-2xl font-bold text-white">
                        Bienvenido, {user?.nombre}
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Aquí tienes un resumen del taller
                    </p>
                </div>

                {/* Main Stats */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription className="text-zinc-400">Servicios del Mes</CardDescription>
                            <Wrench className="h-4 w-4 text-zinc-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{stats?.totalServicesMonth || 0}</div>
                            <p className="text-xs text-zinc-500 mt-1">
                                {stats?.completedServicesMonth || 0} completados
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription className="text-zinc-400">En Proceso</CardDescription>
                            <Clock className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-400">{stats?.inProgressServices || 0}</div>
                            <p className="text-xs text-zinc-500 mt-1">
                                servicios activos
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription className="text-zinc-400">Pendientes</CardDescription>
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-amber-400">{stats?.pendingServices || 0}</div>
                            <p className="text-xs text-zinc-500 mt-1">
                                por iniciar
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardDescription className="text-zinc-400">Ingresos del Mes</CardDescription>
                            <TrendingUp className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-400">
                                {formatCurrency(stats?.incomeThisMonth || 0)}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                servicios completados
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Alerts Section */}
                {(stats?.pendingCommissions || 0) > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {(stats?.pendingCommissions || 0) > 0 && (
                            <Link href="/admin/comisiones">
                                <Card className="border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors cursor-pointer">
                                    <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                        <DollarSign className="h-5 w-5 text-green-400" />
                                        <div>
                                            <CardTitle className="text-base text-green-400">
                                                {stats?.pendingCommissions} Comisiones por Pagar
                                            </CardTitle>
                                            <CardDescription className="text-green-400/70">
                                                Total: {formatCurrency(stats?.pendingCommissionAmount || 0)}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </Link>
                        )}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Recent Services */}
                    <Card className="border-zinc-800 bg-zinc-900/50 lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg text-white">Servicios Recientes</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Últimos servicios registrados
                                </CardDescription>
                            </div>
                            <Link
                                href="/admin/servicios"
                                className="text-sm text-red-400 hover:text-red-300 transition-colors"
                            >
                                Ver todos →
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {recentServices.length > 0 ? (
                                <div className="space-y-3">
                                    {recentServices.map((service) => {
                                        const vehicle = Array.isArray(service.vehicle) ? service.vehicle[0] : service.vehicle
                                        const customer = Array.isArray(service.customer) ? service.customer[0] : service.customer
                                        return (
                                            <Link
                                                key={service.id}
                                                href={`/admin/servicios/${service.id}`}
                                                className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all cursor-pointer group"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 transition-colors">
                                                        <Car className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono text-sm font-medium text-white">
                                                                {vehicle?.patente || 'Sin patente'}
                                                            </span>
                                                            <span className="text-zinc-500">•</span>
                                                            <span className="text-sm text-zinc-400">
                                                                #{service.numero_servicio}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-zinc-500">
                                                            {vehicle?.marca} {vehicle?.modelo} - {customer?.nombre}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {getStatusBadge(service.estado)}
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-500">
                                    No hay servicios registrados
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Workshop Summary */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-lg text-white">Resumen del Taller</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Datos generales
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/admin/clientes" className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-blue-400" />
                                    <span className="text-sm text-zinc-300">Clientes</span>
                                </div>
                                <span className="text-lg font-semibold text-white">{stats?.totalClients || 0}</span>
                            </Link>

                            <Link href="/admin/vehiculos" className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <Car className="h-5 w-5 text-purple-400" />
                                    <span className="text-sm text-zinc-300">Vehículos</span>
                                </div>
                                <span className="text-lg font-semibold text-white">{stats?.totalVehicles || 0}</span>
                            </Link>

                            <Link href="/admin/trabajadores" className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <UserCog className="h-5 w-5 text-green-400" />
                                    <span className="text-sm text-zinc-300">Trabajadores</span>
                                </div>
                                <span className="text-lg font-semibold text-white">{stats?.totalWorkers || 0}</span>
                            </Link>

                            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/30">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                    <span className="text-sm text-zinc-300">Completados (mes)</span>
                                </div>
                                <span className="text-lg font-semibold text-white">{stats?.completedServicesMonth || 0}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
