import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileCheck, Calendar, User, Car, Eye } from 'lucide-react'
import { getQualityReports } from '@/services/quality-reports'
// import { ApproveQualityReportButton } from '@/components/admin/quality/approve-quality-report-button'
// import { RejectQualityReportButton } from '@/components/admin/quality/reject-quality-report-button'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function getStatusBadge(status: string) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        pendiente: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        aprobado: { label: 'Aprobado', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
        rechazado: { label: 'Rechazado', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    }
    const config = statusConfig[status] || { label: status, className: 'bg-zinc-500/10 text-zinc-500' }
    return <Badge variant="outline" className={`text-sm px-3 py-1 ${config.className}`}>{config.label}</Badge>
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default async function CalidadPage() {
    const reports = await getQualityReports('all')

    const pendingReports = reports.filter(r => r.estado === 'pendiente')
    const approvedReports = reports.filter(r => r.estado === 'aprobado')
    const rejectedReports = reports.filter(r => r.estado === 'rechazado')

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Control de Calidad" />

            <div className="flex-1 p-6 space-y-6 pb-24">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileCheck className="h-7 w-7 text-orange-400" />
                        Control de Calidad
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Revisa y aprueba los informes de calidad de los servicios
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Pendientes</CardDescription>
                            <CardTitle className="text-3xl text-amber-400">{pendingReports.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Aprobados</CardDescription>
                            <CardTitle className="text-3xl text-green-400">{approvedReports.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Rechazados</CardDescription>
                            <CardTitle className="text-3xl text-red-400">{rejectedReports.length}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Reports List */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-white">Informes de Calidad</CardTitle>
                        <CardDescription className="text-zinc-400">
                            {reports.length} {reports.length === 1 ? 'informe' : 'informes'} en total
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {reports.length > 0 ? (
                            <div className="space-y-4">
                                {reports.map((report) => {
                                    const service = Array.isArray(report.service) ? report.service[0] : report.service
                                    const vehicle = Array.isArray(service?.vehicle) ? service.vehicle[0] : service?.vehicle
                                    const customer = Array.isArray(vehicle?.customer) ? vehicle.customer[0] : vehicle?.customer

                                    return (
                                        <div
                                            key={report.id}
                                            className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 transition-colors"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0 space-y-3">
                                                    <div className="flex items-center gap-3 flex-wrap">
                                                        {getStatusBadge(report.estado)}
                                                        <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                            <Calendar className="h-4 w-4" />
                                                            <span>{formatDate(report.created_at)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-3 md:grid-cols-2">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Car className="h-4 w-4 text-blue-400" />
                                                            <span className="text-zinc-300">
                                                                {vehicle?.patente || 'Sin patente'} - {vehicle?.marca} {vehicle?.modelo}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <User className="h-4 w-4 text-purple-400" />
                                                            <span className="text-zinc-300">
                                                                {report.worker.nombre} ({report.worker.rol})
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {service && (
                                                        <div className="text-sm">
                                                            <span className="text-zinc-400">Servicio #</span>
                                                            <Link
                                                                href={`/admin/servicios/${service.id}`}
                                                                className="text-blue-400 hover:text-blue-300 ml-1"
                                                            >
                                                                {service.numero_servicio}
                                                            </Link>
                                                        </div>
                                                    )}

                                                    <div className="text-sm">
                                                        <p className="text-zinc-400 mb-1">Descripción:</p>
                                                        <p className="text-zinc-300 whitespace-pre-wrap">{report.descripcion}</p>
                                                    </div>

                                                    {report.observaciones && (
                                                        <div className="text-sm">
                                                            <p className="text-zinc-400 mb-1">Observaciones:</p>
                                                            <p className="text-zinc-300 whitespace-pre-wrap">{report.observaciones}</p>
                                                        </div>
                                                    )}

                                                    {report.razon_rechazo && (
                                                        <div className="text-sm p-3 rounded bg-red-500/10 border border-red-500/30">
                                                            <p className="text-red-400 font-semibold mb-1">Razón del Rechazo:</p>
                                                            <p className="text-red-300 whitespace-pre-wrap">{report.razon_rechazo}</p>
                                                        </div>
                                                    )}

                                                    {report.imagenes && report.imagenes.length > 0 && (
                                                        <div className="text-sm">
                                                            <p className="text-zinc-400 mb-2">
                                                                {report.imagenes.length} {report.imagenes.length === 1 ? 'imagen' : 'imágenes'}
                                                            </p>
                                                            <div className="grid grid-cols-4 gap-2">
                                                                {report.imagenes.slice(0, 4).map((img, idx) => (
                                                                    <a
                                                                        key={idx}
                                                                        href={img}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="relative aspect-square rounded-md overflow-hidden bg-zinc-800 hover:ring-2 hover:ring-orange-400 transition-all group"
                                                                    >
                                                                        <img
                                                                            src={img}
                                                                            alt={`Evidencia ${idx + 1}`}
                                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                                        />
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {report.estado === 'aprobado' && report.aprobado_por && (
                                                        <div className="text-xs text-zinc-500">
                                                            Aprobado por {report.aprobado_por.nombre} el {formatDate(report.fecha_aprobacion)}
                                                        </div>
                                                    )}

                                                    {report.estado === 'rechazado' && report.rechazado_por && (
                                                        <div className="text-xs text-zinc-500">
                                                            Rechazado por {report.rechazado_por.nombre} el {formatDate(report.fecha_rechazo)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 shrink-0">
                                                    {service && (
                                                        <Link href={`/admin/servicios/${service.id}`}>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-zinc-700 text-zinc-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10"
                                                            >
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Ver Servicio
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    {report.estado === 'pendiente' && (
                                                        <div className="flex gap-2">
                                                            {/* Buttons removed for view-only mode */}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 p-12 text-center">
                                <FileCheck className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                <p className="text-zinc-500">
                                    No hay informes de calidad registrados
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
