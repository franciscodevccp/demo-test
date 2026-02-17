import { MOCK_COMMISSIONS, MOCK_SERVICES, MOCK_VEHICLES, MOCK_PANOS } from '@/lib/mock-data'
import type { WorkerCommission, WorkerPano } from '@/types/database'

export interface WorkerCommissionWithService extends WorkerCommission {
    service?: {
        numero_servicio: number
        descripcion_inicial: string | null
        vehicle?: {
            patente: string
            marca: string
            modelo: string
        } | null
    } | null
}

export async function getWorkerPendingCommissions(workerId: string): Promise<WorkerCommissionWithService[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const commissions = MOCK_COMMISSIONS.filter(c => c.worker_id === workerId && c.estado === 'pendiente')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return commissions.map(commission => {
        const service = MOCK_SERVICES.find(s => s.id === commission.service_id)
        let vehicle = null

        if (service) {
            const v = MOCK_VEHICLES.find(ve => ve.id === service.vehicle_id)
            if (v) {
                vehicle = {
                    patente: v.patente,
                    marca: v.marca,
                    modelo: v.modelo
                }
            }
        }

        return {
            ...commission,
            service: service ? {
                numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
                descripcion_inicial: service.descripcion,
                vehicle
            } : null
        } as WorkerCommissionWithService // Casting to avoid strict type checks on mock data
    })
}

export async function getWorkerPanos(workerId: string, startDate?: string, endDate?: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Mock implementation for panos, filtering by date if provided
    let panos = (MOCK_PANOS as any[]).filter(p => p.worker_id === workerId)

    if (startDate) {
        panos = panos.filter(p => p.fecha_asignacion >= startDate)
    }
    if (endDate) {
        panos = panos.filter(p => p.fecha_asignacion <= endDate)
    }

    return panos.sort((a, b) => new Date(b.fecha_asignacion).getTime() - new Date(a.fecha_asignacion).getTime()) as unknown as WorkerPano[]
}

