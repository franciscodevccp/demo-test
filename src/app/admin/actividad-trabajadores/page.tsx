import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Activity, CheckCircle2, AlertTriangle, TrendingUp, Timer } from 'lucide-react'
import { getAllWorkersActivity } from '@/services/worker-activity'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Link from 'next/link'
import type { UserRole } from '@/types/database'

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

function formatHours(hours: number): string {
    if (hours < 1) {
        const minutes = Math.round(hours * 60)
        return `${minutes}m`
    }
    const wholeHours = Math.floor(hours)
    const minutes = Math.round((hours - wholeHours) * 60)
    if (minutes === 0) {
        return `${wholeHours}h`
    }
    return `${wholeHours}h ${minutes}m`
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    }).format(date)
}

function formatDateTime(dateString: string, timeString: string): string {
    if (!dateString || !timeString) return 'Fecha inválida'
    try {
        const date = new Date(`${dateString}T${timeString}`)
        if (isNaN(date.getTime())) return 'Fecha inválida'

        return new Intl.DateTimeFormat('es-CL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date)
    } catch (e) {
        return 'Fecha inválida'
    }
}

interface WorkerActivityDetailsProps {
    activityDetails: any[]
    workerName: string
}

function WorkerActivityDetails({ activityDetails, workerName }: WorkerActivityDetailsProps) {
    if (activityDetails.length === 0) {
        return (
            <div className="text-center py-8 text-zinc-500">
                No hay actividad registrada para este trabajador
            </div>
        )
    }

    return (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {activityDetails.map((activity) => (
                <div
                    key={activity.id}
                    className="border border-zinc-800 rounded-lg p-4 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Link
                                    href={`/admin/servicios/${activity.service_id}`}
                                    className="font-mono text-sm font-semibold text-blue-400 hover:text-blue-300"
                                >
                                    Servicio #{activity.service_number}
                                </Link>
                                <Badge
                                    variant="outline"
                                    className={
                                        activity.estado === 'completado'
                                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                    }
                                >
                                    {activity.estado === 'completado' ? 'Completado' : 'En Proceso'}
                                </Badge>
                                {activity.atrasado && (
                                    <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                                        Atrasado
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-zinc-300">
                                {activity.vehicle_marca} {activity.vehicle_modelo} - {activity.vehicle_patente}
                            </p>
                            <p className="text-xs text-zinc-500">
                                Cliente: {activity.customer_name}
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-zinc-800 text-xs">
                        <div>
                            <span className="text-zinc-500">Inicio:</span>
                            <p className="text-zinc-300 mt-1">
                                {formatDateTime(activity.fecha_inicio_trabajo, activity.hora_inicio_trabajo)}
                            </p>
                        </div>
                        {activity.fecha_fin_trabajo && activity.hora_fin_trabajo && (
                            <div>
                                <span className="text-zinc-500">Fin:</span>
                                <p className="text-zinc-300 mt-1">
                                    {formatDateTime(activity.fecha_fin_trabajo, activity.hora_fin_trabajo)}
                                </p>
                            </div>
                        )}
                        {activity.tiempo_horas !== null && (
                            <div>
                                <span className="text-zinc-500">Tiempo:</span>
                                <p className="text-zinc-300 mt-1 font-semibold">
                                    {formatHours(activity.tiempo_horas)}
                                </p>
                            </div>
                        )}
                        {activity.fecha_estimada_finalizacion && (
                            <div>
                                <span className="text-zinc-500">Fecha Estimada:</span>
                                <p className="text-zinc-300 mt-1">
                                    {formatDate(activity.fecha_estimada_finalizacion)}
                                </p>
                            </div>
                        )}
                    </div>
                    {activity.descripcion && (
                        <div className="mt-3 pt-3 border-t border-zinc-800">
                            <p className="text-xs text-zinc-400">{activity.descripcion}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

export default async function ActividadTrabajadoresPage() {
    const workersStats = await getAllWorkersActivity()

    // Calculate overall stats
    const totalWorkers = workersStats.length
    const totalJobs = workersStats.reduce((sum, ws) => sum + ws.totalJobs, 0)
    const totalCompleted = workersStats.reduce((sum, ws) => sum + ws.completedJobs, 0)
    const totalDelayed = workersStats.reduce((sum, ws) => sum + ws.delayedJobs, 0)
    const averageCompletionRate = totalWorkers > 0
        ? workersStats.reduce((sum, ws) => sum + ws.completionRate, 0) / totalWorkers
        : 0

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Actividad de Trabajadores" />

            <div className="flex-1 p-6 space-y-6">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Activity className="h-7 w-7 text-green-400" />
                        Actividad y Rendimiento de Trabajadores
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Monitoreo de tareas, tiempos y rendimiento del equipo
                    </p>
                </div>

                {/* Overall Stats Cards */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Total Trabajadores</CardDescription>
                            <CardTitle className="text-2xl text-white">{totalWorkers}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                                Trabajos Totales
                            </CardDescription>
                            <CardTitle className="text-2xl text-green-400">
                                {totalJobs}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-zinc-500">
                                {totalCompleted} completados
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-red-400" />
                                Trabajos Atrasados
                            </CardDescription>
                            <CardTitle className="text-2xl text-red-400">
                                {totalDelayed}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-400" />
                                Tasa de Completación
                            </CardDescription>
                            <CardTitle className="text-2xl text-blue-400">
                                {averageCompletionRate.toFixed(1)}%
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Workers Activity Cards */}
                {workersStats.length === 0 ? (
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardContent className="p-12">
                            <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 p-12 text-center">
                                <Activity className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                                <p className="text-zinc-500">
                                    No hay trabajadores activos con actividad registrada
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {workersStats.map((stats) => (
                            <Card key={stats.worker.id} className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-white font-semibold text-lg">
                                                {stats.worker.nombre.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <CardTitle className="text-xl text-white">
                                                    {stats.worker.nombre}
                                                </CardTitle>
                                                <CardDescription className="text-zinc-400">
                                                    {formatRole(stats.worker.rol)}
                                                </CardDescription>
                                            </div>
                                        </div>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                                >
                                                    Ver Detalles
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800">
                                                <DialogHeader>
                                                    <DialogTitle className="text-white">
                                                        Actividad Detallada - {stats.worker.nombre}
                                                    </DialogTitle>
                                                    <DialogDescription className="text-zinc-400">
                                                        Historial completo de tareas y trabajos realizados
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <WorkerActivityDetails
                                                    activityDetails={stats.recentActivity}
                                                    workerName={stats.worker.nombre}
                                                />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {/* Total Jobs */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                <CheckCircle2 className="h-4 w-4" />
                                                Trabajos Totales
                                            </div>
                                            <p className="text-2xl font-bold text-white">
                                                {stats.totalJobs}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {stats.completedJobs} completados
                                            </p>
                                        </div>

                                        {/* Completion Rate */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                <TrendingUp className="h-4 w-4" />
                                                Tasa de Completación
                                            </div>
                                            <p className="text-2xl font-bold text-green-400">
                                                {stats.completionRate.toFixed(1)}%
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {stats.onTimeJobs} a tiempo
                                            </p>
                                        </div>

                                        {/* Average Time */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                <Timer className="h-4 w-4" />
                                                Tiempo Promedio
                                            </div>
                                            <p className="text-2xl font-bold text-blue-400">
                                                {stats.averageTimeHours > 0
                                                    ? formatHours(stats.averageTimeHours)
                                                    : 'N/A'}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {stats.completedJobs > 0
                                                    ? formatHours(stats.totalTimeHours)
                                                    : '0h'} total
                                            </p>
                                        </div>

                                        {/* Delayed Jobs */}
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                <AlertTriangle className="h-4 w-4" />
                                                Trabajos Atrasados
                                            </div>
                                            <p className="text-2xl font-bold text-red-400">
                                                {stats.delayedJobs}
                                            </p>
                                            <p className="text-xs text-zinc-500">
                                                {stats.inProgressJobs} en proceso
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    {stats.totalJobs > 0 && (
                                        <div className="mt-4 pt-4 border-t border-zinc-800">
                                            <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                                                <span>Progreso General</span>
                                                <span>{stats.completedJobs} / {stats.totalJobs}</span>
                                            </div>
                                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${stats.completionRate}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
