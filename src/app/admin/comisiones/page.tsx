import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign } from 'lucide-react'

export default function ComisionesPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Comisiones" />

            <div className="flex-1 p-6">
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <DollarSign className="h-6 w-6 text-emerald-400" />
                            <div>
                                <CardTitle className="text-white">Comisiones de Trabajadores</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Pagos pendientes y realizados
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 p-12 text-center">
                            <p className="text-zinc-500">
                                🚧 Página en construcción
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
