'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { acceptService } from '@/actions/worker-services'
import { toast } from 'sonner'
import { CheckCircle2, Clock, Car, User, Calendar, Wrench, Upload, FileCheck } from 'lucide-react'
import type { AvailableService } from '@/services/worker-services'
import { SubirEvidenciaDialog } from './subir-evidencia-dialog'
import { IniciarControlCalidadDialog } from './iniciar-control-calidad-dialog'
import { SubirEvidenciaCalidadDialog } from './subir-evidencia-calidad-dialog'

interface ServicesListProps {
    services: AvailableService[]
    workerId: string
    workerRole: string
}

export function ServicesList({ services, workerId, workerRole }: ServicesListProps) {
    const [loading, setLoading] = useState<string | null>(null)
    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [selectedQualityService, setSelectedQualityService] = useState<string | null>(null)
    const [selectedQualityEvidenceService, setSelectedQualityEvidenceService] = useState<string | null>(null)
    const isCalidadRole = workerRole === 'sistema_calidad'

    const handleAcceptService = async (serviceId: string) => {
        setLoading(serviceId)
        try {
            const result = await acceptService(serviceId, workerRole)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Trabajo aceptado correctamente')
                // Refresh the page to update the list
                window.location.reload()
            }
        } catch (error) {
            console.error('Error accepting service:', error)
            toast.error('Error al aceptar el trabajo')
        } finally {
            setLoading(null)
        }
    }

    const isServiceTakenByMe = (service: AvailableService) => {
        const history = Array.isArray(service.worker_history) ? service.worker_history : []
        return history.some(
            (h: any) => h.worker_id === workerId && h.worker_role === workerRole
        )
    }

    const isServiceTakenByOther = (service: AvailableService) => {
        const history = Array.isArray(service.worker_history) ? service.worker_history : []
        // Check if ANY worker (not just same role) has the service in progress
        return history.some(
            (h: any) => h.worker_id !== workerId && h.estado === 'en_proceso'
        )
    }

    const getMyServiceStatus = (service: AvailableService) => {
        const history = Array.isArray(service.worker_history) ? service.worker_history : []
        const myHistory = history.find(
            (h: any) => h.worker_id === workerId && h.worker_role === workerRole
        )
        return myHistory?.estado || null
    }

    if (services.length === 0) {
        return (
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <Wrench className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-400">No hay servicios disponibles en este momento</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid gap-4">
                {services.map((service) => {
                    const takenByMe = isServiceTakenByMe(service)
                    const takenByOther = isServiceTakenByOther(service)
                    const myStatus = getMyServiceStatus(service)
                    const isInProgress = myStatus === 'en_proceso'
                    const isCompleted = myStatus === 'completado'

                    return (
                        <Card
                            key={service.id}
                            className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CardTitle className="text-white">
                                                Servicio #{service.numero_servicio}
                                            </CardTitle>
                                            <Badge
                                                variant={
                                                    service.estado === 'completado'
                                                        ? 'default'
                                                        : service.estado === 'en_proceso'
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                                className={
                                                    service.estado === 'completado'
                                                        ? 'bg-green-600'
                                                        : service.estado === 'en_proceso'
                                                        ? 'bg-blue-600'
                                                        : ''
                                                }
                                            >
                                                {service.estado === 'completado'
                                                    ? 'Completado'
                                                    : service.estado === 'en_proceso'
                                                    ? 'En Proceso'
                                                    : 'Pendiente'}
                                            </Badge>
                                            {takenByMe && (
                                                <Badge
                                                    variant="outline"
                                                    className={
                                                        isCompleted
                                                            ? 'border-green-500 text-green-400'
                                                            : 'border-blue-500 text-blue-400'
                                                    }
                                                >
                                                    {isCompleted ? (
                                                        <>
                                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            Completado
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Clock className="h-3 w-3 mr-1" />
                                                            En Proceso
                                                        </>
                                                    )}
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription className="text-zinc-400">
                                            {service.descripcion_inicial || 'Sin descripción'}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Vehicle and Customer Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Car className="h-4 w-4 text-zinc-500" />
                                        <span className="text-zinc-400">
                                            <span className="text-white font-medium">
                                                {service.vehicle?.patente}
                                            </span>
                                            {' - '}
                                            {service.vehicle?.marca} {service.vehicle?.modelo}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-zinc-500" />
                                        <span className="text-zinc-400">
                                            {service.customer?.nombre}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-zinc-500" />
                                        <span className="text-zinc-400">
                                            {new Date(service.fecha_inicio).toLocaleDateString('es-CL', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    {isCalidadRole ? (
                                        // Para sistema_calidad: mostrar botón según el estado
                                        takenByMe && isInProgress ? (
                                            <Button
                                                onClick={() => setSelectedQualityEvidenceService(service.id)}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Subir Evidencia
                                            </Button>
                                        ) : takenByMe && isCompleted ? (
                                            <Button disabled variant="outline" className="w-full">
                                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                                Pendiente de Revisión
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => setSelectedQualityService(service.id)}
                                                className="w-full bg-blue-600 hover:bg-blue-700"
                                            >
                                                <FileCheck className="h-4 w-4 mr-2" />
                                                Iniciar Control de Calidad
                                            </Button>
                                        )
                                    ) : takenByOther ? (
                                        <Button disabled variant="outline" className="w-full">
                                            Ya tomado por otro trabajador
                                        </Button>
                                    ) : takenByMe && isInProgress ? (
                                        <Button
                                            onClick={() => setSelectedService(service.id)}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Subir Evidencia
                                        </Button>
                                    ) : takenByMe && isCompleted ? (
                                        <Button disabled variant="outline" className="w-full">
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Trabajo Completado
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => handleAcceptService(service.id)}
                                            disabled={loading === service.id}
                                            className="w-full bg-red-600 hover:bg-red-700"
                                        >
                                            {loading === service.id ? (
                                                <>
                                                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                                                    Aceptando...
                                                </>
                                            ) : (
                                                <>
                                                    <Wrench className="h-4 w-4 mr-2" />
                                                    Tomar Trabajo
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Subir Evidencia Dialog */}
            {selectedService && (
                <SubirEvidenciaDialog
                    serviceId={selectedService}
                    workerRole={workerRole}
                    onClose={() => setSelectedService(null)}
                />
            )}

            {/* Iniciar Control de Calidad Dialog */}
            {selectedQualityService && (
                <IniciarControlCalidadDialog
                    serviceId={selectedQualityService}
                    workerId={workerId}
                    onClose={() => setSelectedQualityService(null)}
                />
            )}

            {/* Subir Evidencia Calidad Dialog */}
            {selectedQualityEvidenceService && (
                <SubirEvidenciaCalidadDialog
                    serviceId={selectedQualityEvidenceService}
                    workerId={workerId}
                    onClose={() => setSelectedQualityEvidenceService(null)}
                />
            )}
        </>
    )
}

