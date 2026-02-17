'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2, Clock, Car, User, Calendar, Upload, Wrench, ClipboardList } from 'lucide-react'
import type { WorkerJob } from '@/services/worker-services'
import { SubirEvidenciaDialog } from './subir-evidencia-dialog'

interface WorkerJobsListProps {
    jobs: WorkerJob[]
    workerId: string
    workerRole: string
}

export function WorkerJobsList({ jobs, workerId, workerRole }: WorkerJobsListProps) {
    const [selectedService, setSelectedService] = useState<string | null>(null)

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const formatTime = (timeString: string | null) => {
        if (!timeString) return ''
        return timeString.slice(0, 5) // HH:MM
    }

    const isInProgress = (job: WorkerJob) => {
        return job.worker_history?.estado === 'en_proceso'
    }

    const isCompleted = (job: WorkerJob) => {
        return job.worker_history?.estado === 'completado'
    }

    if (jobs.length === 0) {
        return (
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="pt-6">
                    <div className="text-center py-12">
                        <ClipboardList className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-400">No has tomado ningún trabajo aún</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid gap-4">
                {jobs.map((job) => {
                    const inProgress = isInProgress(job)
                    const completed = isCompleted(job)

                    return (
                        <Card
                            key={job.id}
                            className="border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-colors"
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CardTitle className="text-white">
                                                Servicio #{job.numero_servicio}
                                            </CardTitle>
                                            <Badge
                                                variant={
                                                    job.estado === 'completado'
                                                        ? 'default'
                                                        : job.estado === 'en_proceso'
                                                        ? 'secondary'
                                                        : 'outline'
                                                }
                                                className={
                                                    job.estado === 'completado'
                                                        ? 'bg-green-600'
                                                        : job.estado === 'en_proceso'
                                                        ? 'bg-blue-600'
                                                        : ''
                                                }
                                            >
                                                {job.estado === 'completado'
                                                    ? 'Completado'
                                                    : job.estado === 'en_proceso'
                                                    ? 'En Proceso'
                                                    : 'Pendiente'}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    completed
                                                        ? 'border-green-500 text-green-400'
                                                        : inProgress
                                                        ? 'border-blue-500 text-blue-400'
                                                        : ''
                                                }
                                            >
                                                {completed ? (
                                                    <>
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                        Tu Trabajo Completado
                                                    </>
                                                ) : inProgress ? (
                                                    <>
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        En Proceso
                                                    </>
                                                ) : null}
                                            </Badge>
                                        </div>
                                        <CardDescription className="text-zinc-400">
                                            {job.descripcion_inicial || 'Sin descripción'}
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
                                                {job.vehicle?.patente}
                                            </span>
                                            {' - '}
                                            {job.vehicle?.marca} {job.vehicle?.modelo}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-zinc-500" />
                                        <span className="text-zinc-400">
                                            {job.customer?.nombre}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-zinc-500" />
                                        <span className="text-zinc-400">
                                            Inicio: {formatDate(job.fecha_inicio)} {formatTime(job.hora_inicio)}
                                        </span>
                                    </div>
                                    {job.worker_history?.fecha_fin_trabajo && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                            <span className="text-zinc-400">
                                                Completado: {formatDate(job.worker_history.fecha_fin_trabajo)} {formatTime(job.worker_history.hora_fin_trabajo)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Worker History Info */}
                                {job.worker_history && (
                                    <div className="pt-2 border-t border-zinc-800 space-y-2">
                                        <div className="flex items-start gap-2 text-sm">
                                            <Clock className="h-4 w-4 text-zinc-500 mt-0.5" />
                                            <div className="flex-1">
                                                <p className="text-zinc-400">
                                                    <span className="text-white font-medium">Inicio del trabajo:</span>{' '}
                                                    {formatDate(job.worker_history.fecha_inicio_trabajo)} {formatTime(job.worker_history.hora_inicio_trabajo)}
                                                </p>
                                                {job.worker_history.evidencia && (
                                                    <p className="text-zinc-400 mt-1">
                                                        <span className="text-white font-medium">Descripción:</span>{' '}
                                                        {job.worker_history.evidencia}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-2">
                                    {inProgress ? (
                                        <Button
                                            onClick={() => setSelectedService(job.id)}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Subir Evidencia
                                        </Button>
                                    ) : completed ? (
                                        <Button
                                            disabled
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Trabajo Completado
                                        </Button>
                                    ) : (
                                        <Button
                                            disabled
                                            variant="outline"
                                            className="w-full"
                                        >
                                            <Wrench className="h-4 w-4 mr-2" />
                                            Trabajo Pendiente
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
        </>
    )
}

