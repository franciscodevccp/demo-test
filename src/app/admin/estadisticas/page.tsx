import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Receipt, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getFinancialStatistics } from '@/services/statistics'

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

function formatPercentage(current: number, previous: number) {
    // Si ambos son 0, no hay cambio
    if (current === 0 && previous === 0) return '0%'
    
    // Si no hay datos del mes anterior pero hay datos este mes
    if (previous === 0 && current > 0) return 'Nuevo'
    
    // Si había datos el mes anterior pero ahora no hay
    if (previous > 0 && current === 0) return '-100%'
    
    // Calcular el cambio porcentual
    const change = ((current - previous) / previous) * 100
    
    // Limitar a un máximo razonable para evitar números muy grandes
    if (change > 1000) return '>1000%'
    if (change < -100) return '-100%'
    
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`
}

export default async function EstadisticasPage() {
    const stats = await getFinancialStatistics()

    if (!stats) {
        return (
            <div className="flex flex-col min-h-screen">
                <AdminHeader title="Estadísticas" />
                <div className="flex-1 p-6">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardContent className="p-12 text-center">
                            <p className="text-zinc-500">Error al cargar las estadísticas</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    const incomeChange = formatPercentage(stats.incomeThisMonth, stats.incomeLastMonth)
    const expensesChange = formatPercentage(stats.expensesThisMonth, stats.expensesLastMonth)
    const profitChange = formatPercentage(stats.profitThisMonth, stats.profitLastMonth)

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Estadísticas" />

            <div className="flex-1 p-6 space-y-6 pb-24">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="h-7 w-7 text-pink-400" />
                        Estado Financiero del Taller
                    </h2>
                    <p className="text-zinc-400 mt-1">
                        Análisis completo de ingresos, gastos y ganancias
                    </p>
                </div>

                {/* Main Financial Cards */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    {/* Ingresos Totales */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Ingresos Totales</CardDescription>
                            <CardTitle className="text-3xl text-green-400">
                                {formatCurrency(stats.totalIncome)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500">Este mes</p>
                                    <p className="text-sm font-semibold text-white">
                                        {formatCurrency(stats.incomeThisMonth)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500">vs mes anterior</p>
                                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                                        stats.incomeThisMonth >= stats.incomeLastMonth ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {stats.incomeThisMonth >= stats.incomeLastMonth ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4" />
                                        )}
                                        {incomeChange}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gastos Totales */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Gastos Totales</CardDescription>
                            <CardTitle className="text-3xl text-red-400">
                                {formatCurrency(stats.totalExpenses)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500">Este mes</p>
                                    <p className="text-sm font-semibold text-white">
                                        {formatCurrency(stats.expensesThisMonth)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500">vs mes anterior</p>
                                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                                        stats.expensesThisMonth <= stats.expensesLastMonth ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {stats.expensesThisMonth <= stats.expensesLastMonth ? (
                                            <ArrowDownRight className="h-4 w-4" />
                                        ) : (
                                            <ArrowUpRight className="h-4 w-4" />
                                        )}
                                        {expensesChange}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ganancia Neta */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Ganancia Neta</CardDescription>
                            <CardTitle className={`text-3xl ${
                                stats.totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                                {formatCurrency(stats.totalProfit)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-zinc-500">Este mes</p>
                                    <p className={`text-sm font-semibold ${
                                        stats.profitThisMonth >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        {formatCurrency(stats.profitThisMonth)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500">vs mes anterior</p>
                                    <div className={`flex items-center gap-1 text-sm font-semibold ${
                                        stats.profitThisMonth >= stats.profitLastMonth ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {stats.profitThisMonth >= stats.profitLastMonth ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                        ) : (
                                            <ArrowDownRight className="h-4 w-4" />
                                        )}
                                        {profitChange}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    {/* Ingresos Detallados */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-400" />
                                Ingresos
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Desglose de ingresos por período
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                                <span className="text-zinc-400">Mes Actual</span>
                                <span className="text-lg font-bold text-green-400">
                                    {formatCurrency(stats.incomeThisMonth)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                                <span className="text-zinc-400">Mes Anterior</span>
                                <span className="text-lg font-semibold text-white">
                                    {formatCurrency(stats.incomeLastMonth)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                                <span className="text-zinc-400">Año Actual</span>
                                <span className="text-lg font-semibold text-white">
                                    {formatCurrency(stats.incomeThisYear)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <span className="text-emerald-400 font-semibold">Total Histórico</span>
                                <span className="text-xl font-bold text-emerald-400">
                                    {formatCurrency(stats.totalIncome)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gastos Detallados */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2">
                                <TrendingDown className="h-5 w-5 text-red-400" />
                                Gastos
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Desglose de gastos por categoría
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                                    <span className="text-zinc-400">Gastos de Servicios</span>
                                    <span className="text-lg font-semibold text-white">
                                        {formatCurrency(stats.serviceExpenses)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                                    <span className="text-zinc-400">Pagos de Sueldos</span>
                                    <span className="text-lg font-semibold text-white">
                                        {formatCurrency(stats.salaryPayments)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                                    <span className="text-zinc-400">Comisiones Pagadas</span>
                                    <span className="text-lg font-semibold text-white">
                                        {formatCurrency(stats.commissionsPaid)}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-zinc-700">
                                <div className="flex justify-between items-center p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <span className="text-red-400 font-semibold">Total Gastos</span>
                                    <span className="text-xl font-bold text-red-400">
                                        {formatCurrency(stats.totalExpenses)}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-2 border-t border-zinc-700">
                                <div className="flex justify-between items-center p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <span className="text-amber-400 font-semibold">Comisiones Pendientes</span>
                                    <span className="text-lg font-bold text-amber-400">
                                        {formatCurrency(stats.pendingCommissionsAmount)}
                                    </span>
                                </div>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {stats.pendingCommissions} comisión(es) pendiente(s) de pago
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Services Statistics */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-blue-400" />
                            Estadísticas de Servicios
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Resumen de servicios del taller
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                            <div className="p-4 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-500 mb-1">Total Servicios</p>
                                <p className="text-2xl font-bold text-white">{stats.totalServices}</p>
                            </div>
                            <div className="p-4 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-500 mb-1">Completados</p>
                                <p className="text-2xl font-bold text-green-400">{stats.completedServices}</p>
                            </div>
                            <div className="p-4 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-500 mb-1">Este Mes</p>
                                <p className="text-2xl font-bold text-blue-400">{stats.completedServicesThisMonth}</p>
                            </div>
                            <div className="p-4 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-500 mb-1">Mes Anterior</p>
                                <p className="text-2xl font-bold text-zinc-400">{stats.completedServicesLastMonth}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Comparison */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-purple-400" />
                            Comparación Mensual
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Comparación entre mes actual y mes anterior
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                            <div className="p-4 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-500 mb-2">Ingresos</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-xl font-bold text-green-400">
                                        {formatCurrency(stats.incomeThisMonth)}
                                    </p>
                                    <span className="text-xs text-zinc-500">vs</span>
                                    <p className="text-sm text-zinc-400">
                                        {formatCurrency(stats.incomeLastMonth)}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-500 mb-2">Gastos</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-xl font-bold text-red-400">
                                        {formatCurrency(stats.expensesThisMonth)}
                                    </p>
                                    <span className="text-xs text-zinc-500">vs</span>
                                    <p className="text-sm text-zinc-400">
                                        {formatCurrency(stats.expensesLastMonth)}
                                    </p>
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-800/50 rounded-lg">
                                <p className="text-xs text-zinc-500 mb-2">Ganancia</p>
                                <div className="flex items-baseline gap-2">
                                    <p className={`text-xl font-bold ${
                                        stats.profitThisMonth >= 0 ? 'text-emerald-400' : 'text-red-400'
                                    }`}>
                                        {formatCurrency(stats.profitThisMonth)}
                                    </p>
                                    <span className="text-xs text-zinc-500">vs</span>
                                    <p className="text-sm text-zinc-400">
                                        {formatCurrency(stats.profitLastMonth)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
