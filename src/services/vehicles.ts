import { MOCK_VEHICLES, MOCK_CUSTOMERS } from '@/lib/mock-data'

export interface VehicleWithCustomer {
    id: string
    patente: string
    marca: string
    modelo: string
    color: string | null
    kilometraje: number | null
    customer: {
        id: string
        nombre: string
        telefono: string | null
        email: string | null
    } | null
}

export async function searchVehicleByPatente(patente: string): Promise<VehicleWithCustomer | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const vehicle = MOCK_VEHICLES.find(v => v.patente.toLowerCase().includes(patente.toLowerCase()))

    if (!vehicle) return null

    const customer = MOCK_CUSTOMERS.find(c => c.id === vehicle.customer_id)

    return {
        id: vehicle.id,
        patente: vehicle.patente,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        color: vehicle.color,
        kilometraje: vehicle.kilometraje,
        customer: customer ? {
            id: customer.id,
            nombre: customer.nombre,
            telefono: customer.telefono,
            email: customer.email
        } : null
    }
}

export async function getVehicles() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    return MOCK_VEHICLES.sort((a, b) => a.patente.localeCompare(b.patente)).map(v => {
        const customer = MOCK_CUSTOMERS.find(c => c.id === v.customer_id)
        return {
            id: v.id,
            patente: v.patente,
            marca: v.marca,
            modelo: v.modelo,
            color: v.color,
            kilometraje: v.kilometraje,
            customer: customer ? {
                id: customer.id,
                nombre: customer.nombre,
                telefono: customer.telefono,
                email: customer.email
            } : null
        }
    })
}
