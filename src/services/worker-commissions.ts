import { MOCK_COMMISSIONS, MOCK_SERVICES, MOCK_VEHICLES, MOCK_CUSTOMERS } from '@/lib/mock-data'
import type { WorkerCommission } from '@/types/database'

export interface WorkerCommissionWithDetails extends WorkerCommission {
    service: {
        id: string
        numero_servicio: number
        descripcion_inicial: string | null
        estado: string
        fecha_inicio: string
        fecha_fin: string | null
        total: number | null
        vehicle: {
            id: string
            patente: string
            marca: string
            modelo: string
            año: number | null
            color: string | null
        } | null
        customer: {
            id: string
            nombre: string
        } | null
    } | null
}

/**
 * Obtiene todas las comisiones de un trabajador
 */
export async function getWorkerCommissions(workerId: string): Promise<WorkerCommissionWithDetails[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const commissions = MOCK_COMMISSIONS.filter(c => c.worker_id === workerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return commissions.map(commission => {
        const service = MOCK_SERVICES.find(s => s.id === commission.service_id)
        const vehicle = MOCK_VEHICLES.find(v => v.id === service?.vehicle_id)
        const customer = MOCK_CUSTOMERS.find(c => c.id === service?.customer_id)

        // Mock nested objects
        const mockService = service ? {
            id: service.id,
            numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
            descripcion_inicial: service.descripcion,
            estado: service.estado,
            fecha_inicio: service.fecha_ingreso,
            fecha_fin: service.fecha_termino,
            total: service.costo_final,
            vehicle: vehicle ? {
                id: vehicle.id,
                patente: vehicle.patente,
                marca: vehicle.marca,
                modelo: vehicle.modelo,
                año: vehicle.ano,
                color: vehicle.color
            } : null,
            customer: customer ? {
                id: customer.id,
                nombre: customer.nombre
            } : null
        } : null

        return {
            ...commission,
            service: mockService
        } as WorkerCommissionWithDetails
    })
}

