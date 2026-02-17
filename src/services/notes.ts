import { MOCK_NOTES, MOCK_SERVICES, MOCK_VEHICLES, MOCK_USERS } from '@/lib/mock-data'
import type { Note } from '@/types/database'

export interface NoteWithDetails extends Note {
    vehicle: {
        id: string
        patente: string
        marca: string
        modelo: string
        año: number | null
        color: string | null
    } | null
    service: {
        id: string
        numero_servicio: number
        descripcion_inicial: string | null
        estado: string
    } | null
    worker: {
        id: string
        nombre: string
        rol: string
    } | null
}

/**
 * Obtiene todas las notas de un trabajador específico
 */
export async function getWorkerNotes(workerId: string): Promise<NoteWithDetails[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const notes = MOCK_NOTES.filter(n => n.worker_id === workerId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return notes.map(note => {
        const service = MOCK_SERVICES.find(s => s.id === note.service_id)
        const worker = MOCK_USERS.find(u => u.id === note.worker_id)
        const vehicle = MOCK_VEHICLES.find(v => v.id === service?.vehicle_id)

        // Mock nested objects
        const mockService = service ? {
            id: service.id,
            numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
            descripcion_inicial: service.descripcion,
            estado: service.estado
        } : null

        const mockWorker = worker ? {
            id: worker.id,
            nombre: worker.nombre,
            rol: worker.rol
        } : null

        const mockVehicle = vehicle ? {
            id: vehicle.id,
            patente: vehicle.patente,
            marca: vehicle.marca,
            modelo: vehicle.modelo,
            año: vehicle.ano,
            color: vehicle.color
        } : null

        return {
            ...note,
            service: mockService,
            worker: mockWorker,
            vehicle: mockVehicle
        } as NoteWithDetails
    })
}

/**
 * Obtiene todas las notas (para administradores)
 */
export async function getAllNotes(): Promise<NoteWithDetails[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400))

    const notes = [...MOCK_NOTES].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return notes.map(note => {
        const service = MOCK_SERVICES.find(s => s.id === note.service_id)
        const worker = MOCK_USERS.find(u => u.id === note.worker_id)
        const vehicle = MOCK_VEHICLES.find(v => v.id === service?.vehicle_id)

        // Mock nested objects
        const mockService = service ? {
            id: service.id,
            numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
            descripcion_inicial: service.descripcion,
            estado: service.estado
        } : null

        const mockWorker = worker ? {
            id: worker.id,
            nombre: worker.nombre,
            rol: worker.rol
        } : null

        const mockVehicle = vehicle ? {
            id: vehicle.id,
            patente: vehicle.patente,
            marca: vehicle.marca,
            modelo: vehicle.modelo,
            año: vehicle.ano,
            color: vehicle.color
        } : null

        return {
            ...note,
            service: mockService,
            worker: mockWorker,
            vehicle: mockVehicle
        } as NoteWithDetails
    })
}

/**
 * Obtiene servicios relacionados con un vehículo por su matrícula
 */
export async function getServicesByVehiclePatente(patente: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!patente) return []

    const vehicles = MOCK_VEHICLES.filter(v => v.patente.toLowerCase().includes(patente.toLowerCase()))
    const vehicleIds = vehicles.map(v => v.id)

    const services = MOCK_SERVICES.filter(s => vehicleIds.includes(s.vehicle_id))
        .sort((a, b) => new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime())
        .slice(0, 10)

    return services.map(service => {
        const vehicle = MOCK_VEHICLES.find(v => v.id === service.vehicle_id)

        return {
            id: service.id,
            numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
            descripcion_inicial: service.descripcion,
            estado: service.estado,
            fecha_inicio: service.fecha_ingreso,
            vehicle: vehicle ? {
                id: vehicle.id,
                patente: vehicle.patente,
                marca: vehicle.marca,
                modelo: vehicle.modelo,
                año: vehicle.ano,
                color: vehicle.color
            } : null
        }
    })
}

