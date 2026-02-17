import { MOCK_SERVICES, MOCK_VEHICLES, MOCK_CUSTOMERS, MOCK_WORKER_HISTORY, MOCK_COMMISSIONS, MOCK_PARTS, MOCK_PANOS } from '@/lib/mock-data'
import type { Service, Vehicle, Customer, WorkerCommission, ServicePart, WorkerHistoryStatus } from '@/types/database'

export interface AvailableService extends Service {
    vehicle: Vehicle & {
        customer: Customer
    }
    customer: Customer
    commissions: WorkerCommission[]
    parts: ServicePart[]
    worker_history?: Array<{
        id: string
        worker_id: string
        worker_role: string
        estado: string
        fecha_inicio_trabajo: string
        hora_inicio_trabajo: string
    }>
}

export async function getAvailableServicesForWorker(workerId: string, workerRole: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const services = MOCK_SERVICES.filter(s => ['pendiente', 'en_proceso', 'en_progreso'].includes(s.estado))
        .sort((a, b) => new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime())

    // Show all services that are pending or in progress
    // Filter out services taken by ANY worker (bloqueado para todos)
    const availableServices = services.filter(service => {
        const workerHistory = MOCK_WORKER_HISTORY.filter(h => h.service_id === service.id)

        // Check if this worker already took this service
        const takenByMe = workerHistory.some(h => h.worker_id === workerId)

        // El servicio está bloqueado solo si hay algún trabajador con estado 'en_proceso'
        // Si todos los trabajadores completaron, el servicio vuelve a pendiente y otros pueden tomar trabajo
        const hasWorkerInProgress = workerHistory.some(h => h.estado === 'en_proceso')

        const takenByAnyWorker = hasWorkerInProgress

        // Show service if:
        // 1. Worker already took it (to show their own work), OR
        // 2. No worker has taken it yet (available for everyone)
        return takenByMe || !takenByAnyWorker
    })

    // Transform the data
    const transformedServices = availableServices.map(service => {
        const vehicle = MOCK_VEHICLES.find(v => v.id === service.vehicle_id)
        const customer = MOCK_CUSTOMERS.find(c => c.id === service.customer_id)
        const parts = MOCK_PARTS.filter(p => p.service_id === service.id)
        const commissions = MOCK_COMMISSIONS.filter(c => c.service_id === service.id)
        const history = MOCK_WORKER_HISTORY.filter(h => h.service_id === service.id)

        // Handle nested customer in vehicle
        let finalVehicle: any = vehicle
        if (vehicle && customer) {
            finalVehicle = { ...vehicle, customer }
        }

        return {
            ...service,
            id: service.id,
            numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
            estado: service.estado,
            fecha_inicio: service.fecha_ingreso,
            hora_inicio: '09:00',
            vehicle: finalVehicle,
            customer: customer || finalVehicle?.customer || null,
            commissions: commissions,
            parts: parts,
            worker_history: history,
        }
    }) as unknown as AvailableService[] // heavily casting because of mismatching types in mock vs real

    return transformedServices
}

export async function getWorkerServiceHistory(workerId: string, serviceId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))

    return MOCK_WORKER_HISTORY.find(h => h.service_id === serviceId && h.worker_id === workerId) || null
}

export interface WorkerJob extends Service {
    vehicle: Vehicle & {
        customer: Customer
    }
    customer: Customer
    worker_history: {
        id: string
        service_id: string
        worker_id: string
        worker_role: string
        estado: WorkerHistoryStatus
        evidencia: string | null
        evidencia_imagenes: string[] | null
        fecha_inicio_trabajo: string
        hora_inicio_trabajo: string
        fecha_fin_trabajo: string | null
        hora_fin_trabajo: string | null
        evidencia_agregada: boolean
        created_at: string
        updated_at: string
    } | null
}

export async function getWorkerJobs(workerId: string, workerRole: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Get all services where this worker has taken work
    const workerHistory = MOCK_WORKER_HISTORY.filter(h => h.worker_id === workerId && h.worker_role === workerRole)
    const serviceIds = workerHistory.map(h => h.service_id)

    // Get services with relations
    const services = MOCK_SERVICES.filter(s => serviceIds.includes(s.id))
        .sort((a, b) => new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime())

    // Get worker history for each service
    const jobsWithHistory = services.map((service) => {
        const history = workerHistory.find(h => h.service_id === service.id)

        const vehicle = MOCK_VEHICLES.find(v => v.id === service.vehicle_id)
        const customer = MOCK_CUSTOMERS.find(c => c.id === service.customer_id)

        // Handle nested customer in vehicle
        let finalVehicle: any = vehicle
        if (vehicle && customer) {
            finalVehicle = { ...vehicle, customer }
        }

        return {
            ...service,
            id: service.id,
            numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
            state: service.estado,
            vehicle: finalVehicle,
            customer: customer || finalVehicle?.customer || null,
            worker_history: history,
        } as unknown as WorkerJob
    })

    return jobsWithHistory
}

export interface WorkerPanoWithDetails {
    id: string
    worker_id: string
    service_id: string
    task_id: string
    cantidad_panos: number
    fecha_asignacion: string
    created_at: string
    task: {
        id: string
        descripcion: string
        panos: number | null
        costo_mano_obra: number | null
    }
    service: {
        id: string
        numero_servicio: number
        descripcion_inicial: string | null
    }
    vehicle: {
        patente: string
        marca: string
        modelo: string
    } | null
}

export async function getWorkerPanosWithDetails(workerId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Return empty for now as defined in mock data
    return [] as WorkerPanoWithDetails[]
}
