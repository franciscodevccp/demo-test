import { AdminHeader } from '@/components/admin/admin-header'
import { getServiceById } from '@/services/services'
import { notFound } from 'next/navigation'
import { isValidUUID } from '@/lib/utils/validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
    Car,
    User,
    Calendar,
    Clock,
    Wrench,
    FileText,
    ArrowLeft,
    Phone,
    CheckCircle2,
    XCircle,
    Mail,
    Gauge,
    CalendarDays,
    Palette,
    Package,
    DollarSign,
    Percent,
    Camera,
    Download,
    Edit,
    UserCog,
    Video
} from 'lucide-react'
import Link from 'next/link'
import { ServicePDFButton } from '@/components/admin/services/service-pdf-button'
import { CompleteServiceButton } from '@/components/admin/services/complete-service-button'
import { DeleteServiceButton } from '@/components/admin/services/delete-service-button'

interface ServiceDetailPageProps {
    params: Promise<{ id: string }>
}

function getStatusBadge(status: string) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        pendiente: { label: 'Pendiente', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        en_proceso: { label: 'En Proceso', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
        completado: { label: 'Completado', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
        cancelado: { label: 'Cancelado', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    }
    const config = statusConfig[status] || { label: status, className: 'bg-zinc-500/10 text-zinc-500' }
    return <Badge variant="outline" className={`text-base px-3 py-1 ${config.className}`}>{config.label}</Badge>
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-'
    // Parse as local date to avoid timezone issues
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    })
}

function formatCurrency(amount: number | null) {
    if (!amount) return '$0'
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default async function ServiceDetailPage({ params }: ServiceDetailPageProps) {
    const { id } = await params
    
    // Validate UUID format
    if (!isValidUUID(id)) {
        notFound()
    }
    
    const service = await getServiceById(id)

    if (!service) {
        notFound()
    }

    const vehicle = Array.isArray(service.vehicle) ? service.vehicle[0] : service.vehicle
    const customer = Array.isArray(service.customer) ? service.customer[0] : service.customer
    const tasks = service.tasks || []
    const parts = service.parts || []
    const expenses = service.expenses || []
    const commissions = service.commissions || []

    // Calculate totals
    const tasksTotal = tasks.reduce((sum: number, t: { costo_mano_obra: number | null }) => sum + (t.costo_mano_obra || 0), 0)
    const partsTotal = parts.reduce((sum: number, p: { precio_total: number | null }) => sum + (p.precio_total || 0), 0)
    const expensesTotal = expenses.reduce((sum: number, e: { monto: number | null }) => sum + (e.monto || 0), 0)
    const commissionsTotal = commissions.reduce((sum: number, c: { monto_comision: number | null }) => sum + (c.monto_comision || 0), 0)

    // Evidencia inicial - parse JSON string from database
    const evidenciaInicial = service.evidencia_inicial
        ? (typeof service.evidencia_inicial === 'string'
            ? JSON.parse(service.evidencia_inicial)
            : service.evidencia_inicial) as { imagenes?: string[]; videos?: string[]; fecha?: string } | null
        : null

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title={`Servicio #${service.numero_servicio}`} />

            <div className="flex-1 p-6 space-y-6">
                {/* Back button and status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/servicios">
                            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                        </Link>
                        {getStatusBadge(service.estado)}
                    </div>

                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Main info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vehicle & Customer */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Vehicle Card */}
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-zinc-400 flex items-center gap-2">
                                        <Car className="h-4 w-4" />
                                        Vehículo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        <p className="text-xl font-mono font-bold text-white bg-zinc-800 inline-block px-3 py-1 rounded">
                                            {vehicle?.patente || 'Sin patente'}
                                        </p>
                                        <div className="space-y-2">
                                            <p className="text-lg font-semibold text-zinc-200">
                                                {vehicle?.marca} {vehicle?.modelo}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                {vehicle?.año && (
                                                    <div className="flex items-center gap-2 text-zinc-400">
                                                        <CalendarDays className="h-3.5 w-3.5" />
                                                        <span>{vehicle.año}</span>
                                                    </div>
                                                )}
                                                {vehicle?.color && (
                                                    <div className="flex items-center gap-2 text-zinc-400">
                                                        <Palette className="h-3.5 w-3.5" />
                                                        <span>{vehicle.color}</span>
                                                    </div>
                                                )}
                                                {vehicle?.kilometraje && (
                                                    <div className="flex items-center gap-2 text-zinc-400 col-span-2">
                                                        <Gauge className="h-3.5 w-3.5" />
                                                        <span>{vehicle.kilometraje.toLocaleString('es-CL')} km</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Customer Card */}
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-zinc-400 flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Cliente
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2.5">
                                        <p className="text-lg font-semibold text-white">
                                            {customer?.nombre || 'Sin cliente'}
                                        </p>
                                        <div className="space-y-1.5">
                                            {customer?.telefono && (
                                                <a
                                                    href={`tel:${customer.telefono}`}
                                                    className="text-sm text-zinc-400 flex items-center gap-2 hover:text-blue-400 transition-colors"
                                                >
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {customer.telefono}
                                                </a>
                                            )}
                                            {customer?.email && (
                                                <a
                                                    href={`mailto:${customer.email}`}
                                                    className="text-sm text-zinc-400 flex items-center gap-2 hover:text-blue-400 transition-colors"
                                                >
                                                    <Mail className="h-3.5 w-3.5" />
                                                    {customer.email}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Description */}
                        {service.descripcion_inicial && (
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base text-zinc-400 flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Descripción del Problema
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-zinc-300 whitespace-pre-wrap">
                                        {service.descripcion_inicial}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tasks */}
                        <Card className="border-zinc-800 bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Wrench className="h-5 w-5 text-blue-400" />
                                    Tareas / Mano de Obra
                                </CardTitle>
                                <CardDescription className="text-zinc-400">
                                    {tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {tasks.length > 0 ? (
                                    <div className="space-y-2">
                                        {tasks.map((task: { id: string; descripcion: string; costo_mano_obra: number | null; panos: number | null; completado: boolean }) => (
                                            <div
                                                key={task.id}
                                                className="flex items-start justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                                            >
                                                <div className="flex items-start gap-3 flex-1">
                                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${task.completado ? 'bg-green-500' : 'bg-amber-500'}`} />
                                                    <div className="space-y-1">
                                                        <span className="text-zinc-300">{task.descripcion}</span>
                                                        {task.panos !== null && task.panos > 0 && (
                                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                                                                <Wrench className="h-3 w-3" />
                                                                <span>{task.panos} {task.panos === 1 ? 'paño' : 'paños'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-zinc-200 font-semibold">{formatCurrency(task.costo_mano_obra)}</span>
                                            </div>
                                        ))}
                                        <Separator className="bg-zinc-700 my-3" />
                                        <div className="flex justify-between text-sm font-semibold pt-1">
                                            <span className="text-zinc-400">Total Mano de Obra</span>
                                            <span className="text-white text-base">{formatCurrency(tasksTotal)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 text-center py-4">No hay tareas registradas</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Parts */}
                        <Card className="border-zinc-800 bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="text-lg text-white flex items-center gap-2">
                                    <Package className="h-5 w-5 text-green-400" />
                                    Repuestos
                                </CardTitle>
                                <CardDescription className="text-zinc-400">
                                    {parts.length} {parts.length === 1 ? 'repuesto' : 'repuestos'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {parts.length > 0 ? (
                                    <div className="space-y-2">
                                        {parts.map((part: { id: string; nombre_repuesto: string; cantidad: number; precio_unitario: number; precio_total: number }) => (
                                            <div
                                                key={part.id}
                                                className="flex items-start justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                                            >
                                                <div className="space-y-1">
                                                    <span className="text-zinc-300">{part.nombre_repuesto}</span>
                                                    <div className="text-xs text-zinc-500">
                                                        {part.cantidad}x {formatCurrency(part.precio_unitario)} c/u
                                                    </div>
                                                </div>
                                                <span className="text-zinc-200 font-semibold">{formatCurrency(part.precio_total)}</span>
                                            </div>
                                        ))}
                                        <Separator className="bg-zinc-700 my-3" />
                                        <div className="flex justify-between text-sm font-semibold pt-1">
                                            <span className="text-zinc-400">Total Repuestos</span>
                                            <span className="text-white text-base">{formatCurrency(partsTotal)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 text-center py-4">No hay repuestos registrados</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Expenses */}
                        {expenses.length > 0 && (
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-amber-400" />
                                        Costos del Servicio
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">
                                        {expenses.length} {expenses.length === 1 ? 'costo' : 'costos'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {expenses.map((expense: { id: string; descripcion: string; monto: number | null }) => (
                                            <div
                                                key={expense.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                                            >
                                                <span className="text-zinc-300">{expense.descripcion}</span>
                                                <span className="text-zinc-200 font-semibold">{formatCurrency(expense.monto)}</span>
                                            </div>
                                        ))}
                                        <Separator className="bg-zinc-700 my-3" />
                                        <div className="flex justify-between text-sm font-semibold pt-1">
                                            <span className="text-zinc-400">Total Costos</span>
                                            <span className="text-white text-base">{formatCurrency(expensesTotal)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Commissions */}
                        {commissions.length > 0 && (
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white flex items-center gap-2">
                                        <UserCog className="h-5 w-5 text-purple-400" />
                                        Comisiones por Rol
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">
                                        Distribución de comisiones
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {commissions.map((commission: { id: string; worker_role: string | null; monto_base: number | null; porcentaje: number | null; monto_comision: number | null }) => (
                                            <div
                                                key={commission.id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                                            >
                                                <div className="space-y-1">
                                                    <span className="text-zinc-300 capitalize">{commission.worker_role || 'Sin rol'}</span>
                                                    <div className="text-xs text-zinc-500">
                                                        {formatCurrency(commission.monto_base)} × {commission.porcentaje}%
                                                    </div>
                                                </div>
                                                <span className="text-purple-400 font-semibold">{formatCurrency(commission.monto_comision)}</span>
                                            </div>
                                        ))}
                                        <Separator className="bg-zinc-700 my-3" />
                                        <div className="flex justify-between text-sm font-semibold pt-1">
                                            <span className="text-zinc-400">Total Comisiones</span>
                                            <span className="text-white text-base">{formatCurrency(commissionsTotal)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Evidencia Inicial */}
                        {((evidenciaInicial?.imagenes && evidenciaInicial.imagenes.length > 0) || 
                          (evidenciaInicial?.videos && evidenciaInicial.videos.length > 0)) && (
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader>
                                    <CardTitle className="text-lg text-white flex items-center gap-2">
                                        <Camera className="h-5 w-5 text-orange-400" />
                                        Evidencia Inicial
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">
                                        {(() => {
                                            const imageCount = evidenciaInicial?.imagenes?.length || 0
                                            const videoCount = evidenciaInicial?.videos?.length || 0
                                            const parts: string[] = []
                                            if (imageCount > 0) {
                                                parts.push(`${imageCount} ${imageCount === 1 ? 'imagen' : 'imágenes'}`)
                                            }
                                            if (videoCount > 0) {
                                                parts.push(`${videoCount} ${videoCount === 1 ? 'video' : 'videos'}`)
                                            }
                                            return parts.join(' • ')
                                        })()}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Imágenes */}
                                    {evidenciaInicial?.imagenes && evidenciaInicial.imagenes.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-zinc-400 mb-2">Imágenes</h4>
                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                                {evidenciaInicial.imagenes.map((url: string, idx: number) => (
                                                    <a
                                                        key={`img-${idx}`}
                                                        href={url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="relative aspect-square rounded-md overflow-hidden bg-zinc-800 hover:ring-2 hover:ring-orange-400 transition-all group"
                                                    >
                                                        <img
                                                            src={url}
                                                            alt={`Evidencia ${idx + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Download className="h-5 w-5 text-white" />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Videos */}
                                    {evidenciaInicial?.videos && evidenciaInicial.videos.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-zinc-400 mb-2 flex items-center gap-2">
                                                <Video className="h-4 w-4" />
                                                Videos
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {evidenciaInicial.videos.map((url: string, idx: number) => (
                                                    <div
                                                        key={`video-${idx}`}
                                                        className="relative rounded-md overflow-hidden bg-zinc-800 border border-zinc-700"
                                                    >
                                                        <video
                                                            src={url}
                                                            controls
                                                            className="w-full aspect-video object-cover"
                                                            preload="metadata"
                                                        >
                                                            Tu navegador no soporta el elemento de video.
                                                        </video>
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 rounded-md p-2 transition-colors"
                                                        >
                                                            <Download className="h-4 w-4 text-white" />
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6 self-start sticky top-6">
                        {/* Total Card */}
                        <Card className="border-zinc-800 bg-gradient-to-br from-red-950/20 via-zinc-900 to-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="text-base text-zinc-400">Total del Servicio</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-white mb-6">
                                    {formatCurrency(service.total)}
                                </p>
                                <Separator className="bg-zinc-700 mb-4" />
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-zinc-500 flex items-center gap-2">
                                            <Wrench className="h-3.5 w-3.5 text-blue-400" />
                                            Mano de obra
                                        </span>
                                        <span className="text-zinc-200 font-semibold">{formatCurrency(tasksTotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-zinc-500 flex items-center gap-2">
                                            <Package className="h-3.5 w-3.5 text-green-400" />
                                            Repuestos
                                        </span>
                                        <span className="text-zinc-200 font-semibold">{formatCurrency(partsTotal)}</span>
                                    </div>
                                    {expensesTotal > 0 && (
                                        <div className="flex justify-between items-center py-1">
                                            <span className="text-zinc-500 flex items-center gap-2">
                                                <DollarSign className="h-3.5 w-3.5 text-amber-400" />
                                                Costos del servicio
                                            </span>
                                            <span className="text-zinc-200 font-semibold">{formatCurrency(expensesTotal)}</span>
                                        </div>
                                    )}
                                    {commissionsTotal > 0 && (
                                        <>
                                            <Separator className="bg-zinc-700/50" />
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-zinc-500 flex items-center gap-2">
                                                    <UserCog className="h-3.5 w-3.5 text-purple-400" />
                                                    Comisiones
                                                </span>
                                                <span className="text-purple-400 font-semibold">{formatCurrency(commissionsTotal)}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dates Card */}
                        <Card className="border-zinc-800 bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="text-base text-zinc-400 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Fechas
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50">
                                        <span className="text-sm text-zinc-500">Inicio</span>
                                        <span className="text-sm text-white font-medium">{formatDate(service.fecha_inicio)}</span>
                                    </div>
                                    {service.hora_inicio && (
                                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50">
                                            <span className="text-sm text-zinc-500">Hora</span>
                                            <span className="text-sm text-zinc-300 font-mono">{service.hora_inicio}</span>
                                        </div>
                                    )}
                                </div>
                                {service.fecha_estimada_finalizacion && (
                                    <>
                                        <Separator className="bg-zinc-700" />
                                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-zinc-800/50">
                                            <span className="text-sm text-zinc-500">Estimado</span>
                                            <span className="text-sm text-amber-400 font-medium">{formatDate(service.fecha_estimada_finalizacion)}</span>
                                        </div>
                                    </>
                                )}
                                {service.fecha_fin && (
                                    <>
                                        <Separator className="bg-zinc-700" />
                                        <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-green-950/30 border border-green-800/30">
                                            <span className="text-sm text-zinc-500">Finalizado</span>
                                            <span className="text-sm text-green-400 font-medium">{formatDate(service.fecha_fin)}</span>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card className="border-zinc-800 bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="text-base text-zinc-400">Acciones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(service.estado === 'pendiente' || service.estado === 'en_proceso') && (
                                    <div>
                                        <Link href={`/admin/servicios/${id}/editar`} className="w-full">
                                            <Button variant="outline" className="w-full justify-start border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                                                <Edit className="h-4 w-4 mr-2" />
                                                Editar Servicio
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                                <div>
                                    <ServicePDFButton
                                        service={{
                                            numero_servicio: service.numero_servicio,
                                            fecha_inicio: service.fecha_inicio,
                                            fecha_estimada_finalizacion: service.fecha_estimada_finalizacion,
                                            fecha_fin: service.fecha_fin,
                                            estado: service.estado,
                                            total: service.total,
                                            descripcion_inicial: service.descripcion_inicial,
                                            observaciones_finales: service.observaciones_finales,
                                            evidencia_inicial: service.evidencia_inicial
                                        }}
                                        customer={{
                                            nombre: customer.nombre,
                                            rut: customer.rut,
                                            telefono: customer.telefono,
                                            email: customer.email,
                                            direccion: customer.direccion
                                        }}
                                        vehicle={{
                                            patente: vehicle.patente,
                                            marca: vehicle.marca,
                                            modelo: vehicle.modelo,
                                            año: vehicle.año,
                                            color: vehicle.color,
                                            kilometraje: vehicle.kilometraje
                                        }}
                                        tasks={tasks}
                                        parts={parts}
                                        expenses={expenses}
                                    />
                                </div>
                                {(service.estado === 'en_proceso' || service.estado === 'pendiente') && (
                                    <div>
                                        <CompleteServiceButton serviceId={service.id} />
                                    </div>
                                )}
                                <Separator className="bg-zinc-700" />
                                <DeleteServiceButton 
                                    serviceId={service.id} 
                                    serviceNumber={service.numero_servicio} 
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
