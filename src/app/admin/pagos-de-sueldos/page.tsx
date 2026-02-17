import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Plus } from 'lucide-react'
import { getSalaryPayments } from '@/services/salary-payments'
// import { NuevoPagoForm } from '@/components/admin/salary-payments/nuevo-pago-form'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function formatCurrency(amount: number | null) {
    if (!amount && amount !== 0) return '$0'
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date)
}

interface PagosDeSueldosPageProps {
    searchParams: Promise<{ nuevo?: string }>
}

export default async function PagosDeSueldosPage({ searchParams }: PagosDeSueldosPageProps) {
    const params = await searchParams
    const showNewForm = params.nuevo === 'true'

    const payments = await getSalaryPayments('recientes')

    const totalComisiones = payments
        .filter(p => p.tipo_pago === 'comision')
        .reduce((sum, p) => sum + (p.monto || 0), 0)

    const totalPanos = payments
        .filter(p => p.tipo_pago === 'panos')
        .reduce((sum, p) => sum + (p.monto || 0), 0)

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Pago de Sueldos" />

            <div className="flex-1 p-6 space-y-6 pb-24">
                {showNewForm ? (
                    <>
                        <div className="flex items-center gap-4">
                            <Link href="/admin/pagos-de-sueldos">
                                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                                    ← Volver a Pagos
                                </Button>
                            </Link>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Registrar Nuevo Pago</h2>
                            <p className="text-zinc-400 mt-1">
                                Busca un trabajador y registra su pago de sueldo
                            </p>
                        </div>
                        <div className="p-8 text-center text-zinc-400 border border-dashed border-zinc-700 rounded-lg">
                            <p>Funcionalidad desactivada en modo vista.</p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <DollarSign className="h-7 w-7 text-emerald-400" />
                                    Registro de Pagos de Sueldos
                                </h2>
                                <p className="text-zinc-400 mt-1">
                                    Gestión de pagos a trabajadores (comisiones y paños)
                                </p>
                            </div>
                            <Link href="/admin/pagos-de-sueldos?nuevo=true">
                                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nuevo Pago
                                </Button>
                            </Link>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-zinc-400">Total Pagos</CardDescription>
                                    <CardTitle className="text-2xl text-white">{payments.length}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-zinc-400">Total Comisiones</CardDescription>
                                    <CardTitle className="text-2xl text-purple-400">{formatCurrency(totalComisiones)}</CardTitle>
                                </CardHeader>
                            </Card>
                            <Card className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader className="pb-2">
                                    <CardDescription className="text-zinc-400">Total Paños</CardDescription>
                                    <CardTitle className="text-2xl text-green-400">{formatCurrency(totalPanos)}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Payments List */}
                        <Card className="border-zinc-800 bg-zinc-900/50">
                            <CardHeader>
                                <CardTitle className="text-white">Historial de Pagos</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Lista de todos los pagos registrados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {payments.length > 0 ? (
                                    <div className="space-y-3">
                                        {payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-800 transition-colors"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className="font-semibold text-white">
                                                                {payment.worker.nombre}
                                                            </span>
                                                            <span className={`text-xs px-2 py-1 rounded-full ${payment.tipo_pago === 'comision'
                                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                                }`}>
                                                                {payment.tipo_pago === 'comision' ? 'Comisión' : 'Paños'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-zinc-400">
                                                            {formatDate(payment.fecha_pago)}
                                                        </p>
                                                        {payment.tipo_pago === 'panos' && payment.cantidad_panos && payment.precio_pano && (
                                                            <p className="text-xs text-zinc-500 mt-1">
                                                                {payment.cantidad_panos} paño{payment.cantidad_panos !== 1 ? 's' : ''} × {formatCurrency(payment.precio_pano)}
                                                            </p>
                                                        )}
                                                        {payment.descripcion && (
                                                            <p className="text-sm text-zinc-300 mt-2">{payment.descripcion}</p>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-emerald-400">
                                                            {formatCurrency(payment.monto)}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 mt-1">
                                                            Registrado por {payment.created_by.nombre}
                                                        </p>
                                                    </div>
                                                </div>
                                                {payment.comprobante_imagenes && payment.comprobante_imagenes.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-zinc-700">
                                                        <p className="text-xs text-zinc-500 mb-2">
                                                            {payment.comprobante_imagenes.length} comprobante{payment.comprobante_imagenes.length !== 1 ? 's' : ''}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 border border-dashed border-zinc-700 rounded-lg bg-zinc-900/30">
                                        <DollarSign className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                                        <p className="text-sm text-zinc-400">No hay pagos registrados</p>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            Comienza registrando un nuevo pago
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    )
}

