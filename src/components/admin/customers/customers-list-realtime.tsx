'use client'

import { useState, useEffect } from 'react'
import { CustomersList } from './CustomersList'
import { toast } from 'sonner'
import type { Customer } from '@/services/customers'

interface CustomersListRealtimeProps {
    initialCustomers: Customer[]
}

export function CustomersListRealtime({ initialCustomers }: CustomersListRealtimeProps) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers)

    useEffect(() => {
        setCustomers(initialCustomers)
    }, [initialCustomers])

    return <CustomersList customers={customers} />
}
