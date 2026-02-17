import { MOCK_CUSTOMERS, MOCK_VEHICLES } from '@/lib/mock-data'
import type { Customer, Vehicle } from '@/types/database'
export type { Customer, Vehicle }

export interface CustomerWithVehicles extends Customer {
    vehicles: Vehicle[]
}

export async function getCustomers(orderBy: 'recientes' | 'antiguos' = 'recientes') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const customers = [...MOCK_CUSTOMERS].sort((a, b) => {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return orderBy === 'antiguos' ? dateA - dateB : dateB - dateA
    })

    return customers.map(customer => {
        const customerVehicles = MOCK_VEHICLES.filter(v => v.customer_id === customer.id)
        return {
            ...customer,
            vehicles: customerVehicles
        }
    })
}
