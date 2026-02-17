'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Calendar, Car, User, FileText } from 'lucide-react'
import type { WorkerCommissionWithDetails } from '@/services/worker-commissions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface WorkerCommissionsListProps {
    commissions: WorkerCommissionWithDetails[]
}

function formatCurrency(amount: number | null) {
    if (!amount) return '$0'
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

function getStatusBadge(status: string) {
    const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
        pendiente: { label: 'Pendiente', variant: 'outline' },
        pagada: { label: 'Pagada', variant: 'default' },
        cancelada: { label: 'Cancelada', variant: 'destructive' },
    }
    const statusConfig = config[status] || { label: status, variant: 'outline' }
    return <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
}

export function WorkerCommissionsList({ commissions }: WorkerCommissionsListProps) {
    if (commissions.length === 0) {
        return (
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <DollarSign className="h-12 w-12 text-zinc-600 mb-4" />
                    <p className="text-zinc-400 text-center">
                        No tienes comisiones registradas.
                    </p>
                    <p className="text-sm text-zinc-500 mt-2 text-center">
                        Las comisiones aparecerán aquí cuando se te asignen servicios.
                    </p>
                </CardContent>
            </Card>
        )
    }

    // Calculate totals
    const totalCommissions = commissions.reduce((sum, c) => sum + (c.monto_comision || 0), 0)
    const paidCommissions = commissions
        .filter(c => c.estado === 'pagada')
        .reduce((sum, c) => sum + (c.monto_comision || 0), 0)
    const pendingCommissions = commissions
        .filter(c => c.estado === 'pendiente')
        .reduce((sum, c) => sum + (c.monto_comision || 0), 0)

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-400">Total de Comisiones</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">
                            {formatCurrency(totalCommissions)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-400">Comisiones Pagadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                            {formatCurrency(paidCommissions)}
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-400">Comisiones Pendientes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-400">
                            {formatCurrency(pendingCommissions)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Commissions List */}
            <div className="space-y-4">
                {commissions.map((commission) => (
                    <Card key={commission.id} className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-lg text-white">
                                            {commission.service 
                                                ? `Servicio #${commission.service.numero_servicio}`
                                                : 'Servicio eliminado'
                                            }
                                        </CardTitle>
                                        {getStatusBadge(commission.estado)}
                                    </div>
                                    {commission.service?.descripcion_inicial && (
                                        <CardDescription className="text-zinc-400">
                                            {commission.service.descripcion_inicial}
                                        </CardDescription>
                                    )}
                                    {commission.service?.vehicle && (
                                        <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                                            <Car className="h-4 w-4" />
                                            {commission.service.vehicle.patente} - {commission.service.vehicle.marca} {commission.service.vehicle.modelo}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-400">
                                        {formatCurrency(commission.monto_comision)}
                                    </div>
                                    {commission.porcentaje && commission.monto_base && (
                                        <div className="text-xs text-zinc-500 mt-1">
                                            {commission.porcentaje}% de {formatCurrency(commission.monto_base)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {format(new Date(commission.created_at), "dd 'de' MMM, yyyy", { locale: es })}
                                    </span>
                                </div>
                                {commission.service?.customer && (
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <User className="h-4 w-4" />
                                        <span>{commission.service.customer.nombre}</span>
                                    </div>
                                )}
                                {commission.service?.estado && (
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <FileText className="h-4 w-4" />
                                        <span className="capitalize">{commission.service.estado}</span>
                                    </div>
                                )}
                                {commission.worker_role && (
                                    <div className="flex items-center gap-2 text-zinc-400">
                                        <span className="capitalize">{commission.worker_role}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

