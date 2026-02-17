import { AdminHeader } from '@/components/admin/admin-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Car, Plus } from 'lucide-react'
import { getCustomers, type CustomerWithVehicles } from '@/services/customers'
import { CustomersFilters } from '@/components/admin/customers/customers-filters'
import { CustomersListRealtime } from '@/components/admin/customers/customers-list-realtime'
import Link from 'next/link'

interface ClientesPageProps {
    searchParams: Promise<{ orden?: string; buscar?: string }>
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
    const params = await searchParams
    const orderBy = (params.orden === 'antiguos' ? 'antiguos' : 'recientes') as 'recientes' | 'antiguos'
    const search = params.buscar || ''

    const customers = await getCustomers(orderBy)

    // Filter by patente if search term is provided
    const filteredCustomers: CustomerWithVehicles[] = search
        ? customers.filter(customer =>
            customer.vehicles.some(vehicle =>
                vehicle.patente?.toUpperCase().includes(search.toUpperCase())
            )
        )
        : customers

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Clientes" />

            <div className="flex-1 p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Users className="h-7 w-7 text-green-400" />
                            Gestión de Clientes
                        </h2>
                        <p className="text-zinc-400 mt-1">
                            Información personal de clientes y sus vehículos
                        </p>
                    </div>
                    <Link href="/admin/clientes/nuevo">
                        <Button className="bg-red-600 hover:bg-red-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Nuevo Cliente
                        </Button>
                    </Link>
                </div>

                {/* Stats Card */}
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Total Clientes</CardDescription>
                            <CardTitle className="text-2xl text-white">{filteredCustomers.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400 flex items-center gap-2">
                                <Car className="h-4 w-4 text-blue-400" />
                                Total Vehículos
                            </CardDescription>
                            <CardTitle className="text-2xl text-blue-400">
                                {filteredCustomers.reduce((total, customer) => total + customer.vehicles.length, 0)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader className="pb-2">
                            <CardDescription className="text-zinc-400">Promedio Vehículos/Cliente</CardDescription>
                            <CardTitle className="text-2xl text-green-400">
                                {filteredCustomers.length > 0
                                    ? (filteredCustomers.reduce((total, customer) => total + customer.vehicles.length, 0) / filteredCustomers.length).toFixed(1)
                                    : '0'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Filters */}
                <CustomersFilters currentSort={orderBy} currentSearch={search} />

                {/* Customers List */}
                <CustomersListRealtime initialCustomers={filteredCustomers} />
            </div>
        </div>
    )
}