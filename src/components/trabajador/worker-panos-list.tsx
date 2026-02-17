'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Calendar, Car, Wrench } from 'lucide-react'
import type { WorkerPanoWithDetails } from '@/services/worker-services'

interface WorkerPanosListProps {
    panos: WorkerPanoWithDetails[]
}

export function WorkerPanosList({ panos }: WorkerPanosListProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    // Group panos by service
    const panosByService = panos.reduce((acc, pano) => {
        const serviceId = pano.service_id
        if (!acc[serviceId]) {
            acc[serviceId] = []
        }
        acc[serviceId].push(pano)
        return acc
    }, {} as Record<string, WorkerPanoWithDetails[]>)

    if (panos.length === 0) {
        return (
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <Package className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-400">No has obtenido paños aún</p>
                        <p className="text-sm text-zinc-500 mt-2">
                            Completa trabajos para empezar a acumular paños
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {Object.entries(panosByService).map(([serviceId, servicePanos]) => {
                const firstPano = servicePanos[0]
                const serviceTotal = servicePanos.reduce((sum, p) => sum + (p.cantidad_panos || 0), 0)

                return (
                    <Card
                        key={serviceId}
                        className="border-zinc-800 bg-zinc-900/50"
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CardTitle className="text-white">
                                            Servicio #{firstPano.service?.numero_servicio || 'N/A'}
                                        </CardTitle>
                                        <Badge variant="outline" className="border-amber-500 text-amber-400">
                                            {servicePanos.length} {servicePanos.length === 1 ? 'tarea' : 'tareas'}
                                        </Badge>
                                    </div>
                                    {firstPano.service?.descripcion_inicial && (
                                        <CardDescription className="text-zinc-400">
                                            {firstPano.service.descripcion_inicial}
                                        </CardDescription>
                                    )}
                                    {firstPano.vehicle && (
                                        <div className="flex items-center gap-2 mt-2 text-sm text-zinc-400">
                                            <Car className="h-4 w-4" />
                                            {firstPano.vehicle.patente} - {firstPano.vehicle.marca} {firstPano.vehicle.modelo}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-amber-400">
                                        {serviceTotal}
                                    </div>
                                    <div className="text-xs text-zinc-500">paños totales</div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {servicePanos.map((pano) => (
                                    <div
                                        key={pano.id}
                                        className="flex items-center justify-between p-3 rounded-lg border border-zinc-700 bg-zinc-800/30"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <Wrench className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium truncate">
                                                    {pano.task?.descripcion || 'Tarea desconocida'}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                        <Calendar className="h-3 w-3" />
                                                        {formatDate(pano.fecha_asignacion)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {pano.cantidad_panos > 0 ? (
                                                <Badge className="bg-amber-600 text-white">
                                                    <Package className="h-3 w-3 mr-1" />
                                                    {pano.cantidad_panos} {pano.cantidad_panos === 1 ? 'paño' : 'paños'}
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                                                    Sin paños
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}

