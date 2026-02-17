import { MOCK_SERVICES, MOCK_VEHICLES, MOCK_CUSTOMERS } from '@/lib/mock-data'
import type { ServiceStatus } from '@/types/database'

export interface ServiceWithRelations {
    id: string
    numero_servicio: number
    estado: ServiceStatus
    fecha_inicio: string
    hora_inicio: string
    fecha_estimada_finalizacion: string | null
    fecha_fin: string | null
    descripcion_inicial: string | null
    total: number | null
    created_at: string
    mechanic_id: string | null
    vehicle: {
        id: string
        patente: string
        marca: string
        modelo: string
        año: number | null
        color: string | null
        kilometraje: number | null
    } | null
    customer: {
        id: string
        nombre: string
        telefono: string | null
        email: string | null
    } | null
}

export async function getServices(status?: ServiceStatus | 'all') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    let services = [...MOCK_SERVICES].sort((a, b) =>
        new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime()
    )

    if (status && status !== 'all') {
        services = services.filter(s => s.estado === status)
    }

    return services.map(service => {
        const vehicle = MOCK_VEHICLES.find(v => v.id === service.vehicle_id)
        const customer = MOCK_CUSTOMERS.find(c => c.id === service.customer_id)

        return {
            ...service,
            id: service.id,
            numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'), // Fake number
            estado: service.estado as ServiceStatus,
            fecha_inicio: service.fecha_ingreso,
            hora_inicio: '09:00', // Fake time
            fecha_estimada_finalizacion: null,
            fecha_fin: service.fecha_termino,
            descripcion_inicial: service.descripcion,
            total: service.costo_final || service.costo_estimado,
            created_at: service.fecha_ingreso,
            mechanic_id: service.trabajador_id,
            vehicle: vehicle ? {
                id: vehicle.id,
                patente: vehicle.patente,
                marca: vehicle.marca,
                modelo: vehicle.modelo,
                año: vehicle.año,
                color: vehicle.color,
                kilometraje: vehicle.kilometraje
            } : null,
            customer: customer ? {
                id: customer.id,
                nombre: customer.nombre,
                telefono: customer.telefono,
                email: customer.email
            } : null
        }
    }) as ServiceWithRelations[]
}

export async function getServiceById(id: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const service = MOCK_SERVICES.find(s => s.id === id)
    if (!service) return null

    const vehicle = MOCK_VEHICLES.find(v => v.id === service.vehicle_id)
    const customer = MOCK_CUSTOMERS.find(c => c.id === service.customer_id)

    return {
        ...service,
        id: service.id,
        numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
        estado: service.estado as ServiceStatus,
        fecha_inicio: service.fecha_ingreso,
        hora_inicio: '09:00',
        fecha_estimada_finalizacion: null,
        fecha_fin: service.fecha_termino,
        descripcion_inicial: service.descripcion,
        total: service.costo_final || service.costo_estimado,
        created_at: service.fecha_ingreso,
        mechanic_id: service.trabajador_id,
        // Add missing properties from Service interface
        completed_by_id: null,
        cancelled_by_id: null,
        fecha_inicio_trabajo: null,
        hora_inicio_trabajo: null,
        fecha_fin_trabajo: null,
        hora_fin_trabajo: null,
        diagnostico: service.diagnostico || null,
        trabajos_realizados: service.trabajos_realizados || null,
        repuestos_utilizados: service.repuestos_utilizados || null,
        observaciones_finales: service.observaciones_finales || null,
        evidencia_inicial: service.evidencia_inicial || null,
        vehicle: vehicle,
        customer: customer,
        tasks: [],
        parts: [],
        expenses: [],
        commissions: [] // worker_commissions
    }
}

export async function getServicesCount() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))

    const total = MOCK_SERVICES.length
    const pending = MOCK_SERVICES.filter(s => s.estado === 'pendiente').length
    const inProgress = MOCK_SERVICES.filter(s => s.estado === 'en_proceso' || s.estado === 'en_progreso').length
    const completed = MOCK_SERVICES.filter(s => s.estado === 'completado').length

    return {
        total,
        pending,
        inProgress,
        completed
    }
}
