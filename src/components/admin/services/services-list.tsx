import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Car, Calendar, User, ChevronRight } from 'lucide-react'
import type { ServiceWithRelations } from '@/services/services'

interface ServicesListProps {
    services: ServiceWithRelations[]
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

function formatDate(dateStr: string) {
    // Parse as local date to avoid timezone issues
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })
}

function formatCurrency(amount: number | null) {
    if (!amount) return '-'
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

export function ServicesList({ services }: ServicesListProps) {
    if (services.length === 0) {
        return (
            <div className="text-center py-12">
                <Car className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500">No hay servicios para mostrar</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {services.map((service) => (
                <Link
                    key={service.id}
                    href={`/admin/servicios/${service.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all group"
                >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                        {/* Vehicle Icon */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-white transition-colors">
                            <Car className="h-6 w-6" />
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                {/* Patente */}
                                <span className="font-mono text-sm font-semibold text-white bg-zinc-800 px-2 py-0.5 rounded">
                                    {service.vehicle?.patente || 'Sin patente'}
                                </span>
                                {/* Número de servicio */}
                                <span className="text-xs text-zinc-500">
                                    #{service.numero_servicio}
                                </span>
                                {/* Status badge */}
                                {getStatusBadge(service.estado)}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-400">
                                {/* Vehicle info */}
                                <span>
                                    {service.vehicle?.marca} {service.vehicle?.modelo}
                                    {service.vehicle?.color && ` • ${service.vehicle.color}`}
                                </span>

                                {/* Customer */}
                                {service.customer && (
                                    <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {service.customer.nombre}
                                    </span>
                                )}

                                {/* Date */}
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(service.fecha_inicio)}
                                </span>
                            </div>

                            {/* Description preview */}
                            {service.descripcion_inicial && (
                                <p className="text-xs text-zinc-500 mt-1 truncate max-w-md">
                                    {service.descripcion_inicial}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-4 ml-4">
                        {/* Total */}
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-white">
                                {formatCurrency(service.total)}
                            </p>
                            {service.fecha_estimada_finalizacion && (
                                <p className="text-xs text-zinc-500">
                                    Est: {formatDate(service.fecha_estimada_finalizacion)}
                                </p>
                            )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                </Link>
            ))}
        </div>
    )
}
