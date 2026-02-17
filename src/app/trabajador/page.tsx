import { getUser } from '@/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MobileMenuButton } from '@/components/trabajador/mobile-menu-button'
import { getWorkerDashboardStats } from '@/services/worker-dashboard'
import {
    LayoutDashboard,
    Wrench,
    ClipboardList,
    DollarSign,
    StickyNote,
    CheckCircle2,
    Clock,
    Package
} from 'lucide-react'

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

export default async function TrabajadorDashboard() {
    const user = await getUser()
    
    // Get worker stats
    const stats = user ? await getWorkerDashboardStats(user.id) : null

    const getRoleLabel = (rol: string) => {
        const roles: Record<string, string> = {
            mecanico: 'Mecánico',
            pintor: 'Pintor',
            desabolladura: 'Desabolladura',
            preparacion: 'Preparación',
            armado: 'Armado',
            lavado: 'Lavado',
            pulido: 'Pulido',
            calidad: 'Control de Calidad',
            sistema_calidad: 'Sistema de Calidad',
        }
        return roles[rol] || rol
    }

    // Determine quick actions based on role
    const isCommissionRole = user?.rol === 'mecanico' || user?.rol === 'desabolladura'
    
    const quickActions = [
        { icon: Wrench, label: 'Servicios Disponibles', href: '/trabajador/servicios', color: 'text-blue-400' },
        { icon: ClipboardList, label: 'Mis Trabajos', href: '/trabajador/trabajos', color: 'text-green-400' },
        isCommissionRole
            ? { icon: DollarSign, label: 'Mis Comisiones', href: '/trabajador/comisiones', color: 'text-amber-400' }
            : { icon: Package, label: 'Mis Paños', href: '/trabajador/panos', color: 'text-amber-400' },
        { icon: StickyNote, label: 'Mis Notas', href: '/trabajador/notas', color: 'text-purple-400' },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MobileMenuButton />
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <LayoutDashboard className="h-7 w-7 text-red-500" />
                            Mi Panel
                        </h1>
                        <p className="mt-1 text-zinc-400">
                            <span className="text-white font-medium">{user?.nombre}</span>
                            <span className="mx-2">•</span>
                            <span className="text-red-400">{user?.rol && getRoleLabel(user.rol)}</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2">
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-400 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Pendientes
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-amber-400">
                            {stats?.pendingJobs ?? 0}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-zinc-500">trabajos por hacer</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="pb-2">
                        <CardDescription className="text-zinc-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Completados
                        </CardDescription>
                        <CardTitle className="text-3xl font-bold text-green-400">
                            {stats?.completedJobsThisMonth ?? 0}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-zinc-500">este mes</p>
                    </CardContent>
                </Card>
            </div>

            {/* Comisiones Card */}
            <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-900/50">
                <CardHeader>
                    <CardDescription className="text-zinc-400">Comisiones Pendientes</CardDescription>
                    <CardTitle className="text-2xl font-bold text-white">
                        {stats ? formatCurrency(stats.pendingCommissionsAmount) : '$0'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-zinc-500">Actualizado recientemente</p>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="space-y-3">
                <h2 className="text-lg font-semibold text-white">Acciones</h2>
                <div className="grid gap-3 grid-cols-2">
                    {quickActions.map((action) => (
                        <a
                            key={action.href}
                            href={action.href}
                            className="flex flex-col items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-red-500/50 hover:bg-zinc-800 active:scale-95"
                        >
                            <action.icon className={`h-6 w-6 ${action.color}`} />
                            <span className="text-xs font-medium text-white text-center">{action.label}</span>
                        </a>
                    ))}
                </div>
            </div>

        </div>
    )
}
