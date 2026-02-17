import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car } from 'lucide-react'

export default function VehiculosPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Vehículos" />

            <div className="flex-1 p-6">
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <Car className="h-6 w-6 text-purple-400" />
                            <div>
                                <CardTitle className="text-white">Gestión de Vehículos</CardTitle>
                                <CardDescription className="text-zinc-400">
                                    Lista de vehículos registrados
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
