'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Search, Plus, Phone, Mail, Car } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import type { Customer } from '@/services/customers'
import { DeleteCustomerButton } from './delete-customer-button'

interface CustomersListProps {
    customers: Customer[]
}

export function CustomersList({ customers }: CustomersListProps) {
    const [searchTerm, setSearchTerm] = useState('')

    const filteredCustomers = customers.filter(customer =>
        customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.telefono?.includes(searchTerm)
    )

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle>Clientes ({customers.length})</CardTitle>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar cliente..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Link href="/admin/clientes/nuevo">
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Nuevo
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Contacto</TableHead>
                                <TableHead>Fecha Registro</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                        No se encontraron clientes
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell className="font-medium">
                                            {customer.nombre}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-sm">
                                                {customer.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                                        <span>{customer.email}</span>
                                                    </div>
                                                )}
                                                {customer.telefono && (
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="w-3 h-3 text-muted-foreground" />
                                                        <span>{customer.telefono}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(customer.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/clientes/${customer.id}`}>
                                                    <Button variant="ghost" size="sm">
                                                        Ver detalle
                                                    </Button>
                                                </Link>
                                                <DeleteCustomerButton
                                                    customerId={customer.id}
                                                    customerName={customer.nombre}
                                                    vehicleCount={0}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
