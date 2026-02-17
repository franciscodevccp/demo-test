import { MOCK_USERS, MOCK_WORKER_HISTORY, MOCK_SERVICES, MOCK_VEHICLES, MOCK_CUSTOMERS } from '@/lib/mock-data'
import type { Profile, ServiceWorkerHistory, Service } from '@/types/database'

export interface WorkerActivityStats {
    worker: Profile
    totalJobs: number
    completedJobs: number
    inProgressJobs: number
    totalTimeHours: number
    averageTimeHours: number
    delayedJobs: number
    onTimeJobs: number
    completionRate: number
    recentActivity: WorkerActivityDetail[]
}

export interface WorkerActivityDetail {
    id: string
    service_id: string
    service_number: number
    vehicle_patente: string
    vehicle_marca: string
    vehicle_modelo: string
    customer_name: string
    worker_role: string
    fecha_inicio_trabajo: string
    hora_inicio_trabajo: string
    fecha_fin_trabajo: string | null
    hora_fin_trabajo: string | null
    fecha_estimada_finalizacion: string | null
    estado: 'en_proceso' | 'completado'
    tiempo_horas: number | null
    tiempo_estimado_horas: number | null
    atrasado: boolean
    descripcion: string | null
    evidencia_agregada: boolean
    reporte_rechazado: boolean
}

export async function getAllWorkersActivity(): Promise<WorkerActivityStats[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const workers = MOCK_USERS.filter(u => u.rol !== 'admin' && u.rol !== undefined)

    const workersStats: WorkerActivityStats[] = workers.map((worker) => {
        const workerHistory = MOCK_WORKER_HISTORY.filter(h => h.worker_id === worker.id)

        const activityDetails: WorkerActivityDetail[] = workerHistory.map((h) => {
            const service = MOCK_SERVICES.find(s => s.id === h.service_id)
            const vehicle = MOCK_VEHICLES.find(v => v.id === service?.vehicle_id)
            const customer = MOCK_CUSTOMERS.find(c => c.id === service?.customer_id)

            let tiempoHoras: number | null = null
            if (h.fecha_fin_trabajo && h.hora_fin_trabajo) {
                const startDateTime = new Date(`${h.fecha_inicio_trabajo}T${h.hora_inicio_trabajo}`)
                const endDateTime = new Date(`${h.fecha_fin_trabajo}T${h.hora_fin_trabajo}`)
                const diffMs = endDateTime.getTime() - startDateTime.getTime()
                tiempoHoras = diffMs / (1000 * 60 * 60)
            }

            let atrasado = false
            // Simplified logic for mock
            if (h.estado === 'completado' && h.fecha_fin_trabajo && service?.fecha_ingreso) {
                const fechaInicio = new Date(service.fecha_ingreso)
                // Mock Logic: if finished more than 3 days after creation, it is delayed
                const fechaFin = new Date(h.fecha_fin_trabajo)
                const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                atrasado = diffDays > 3
            }

            return {
                id: h.id,
                service_id: h.service_id,
                service_number: service ? 1000 + parseInt(service.id.split('-')[1] || '0') : 0,
                vehicle_patente: vehicle?.patente || 'N/A',
                vehicle_marca: vehicle?.marca || 'N/A',
                vehicle_modelo: vehicle?.modelo || 'N/A',
                customer_name: customer?.nombre || 'N/A',
                worker_role: h.worker_role,
                fecha_inicio_trabajo: h.fecha_inicio_trabajo,
                hora_inicio_trabajo: h.hora_inicio_trabajo,
                fecha_fin_trabajo: h.fecha_fin_trabajo,
                hora_fin_trabajo: h.hora_fin_trabajo,
                fecha_estimada_finalizacion: null,
                estado: h.estado as 'en_proceso' | 'completado',
                tiempo_horas: tiempoHoras,
                tiempo_estimado_horas: null,
                atrasado,
                descripcion: null,
                evidencia_agregada: h.evidencia_agregada,
                reporte_rechazado: false
            }
        })

        const totalJobs = workerHistory.length
        const completedJobs = workerHistory.filter(h => h.estado === 'completado').length
        const inProgressJobs = workerHistory.filter(h => h.estado === 'en_proceso').length

        const completedWithTime = activityDetails.filter(a => a.tiempo_horas !== null && a.estado === 'completado')
        const totalTimeHours = completedWithTime.reduce((sum, a) => sum + (a.tiempo_horas || 0), 0)
        const averageTimeHours = completedWithTime.length > 0
            ? totalTimeHours / completedWithTime.length
            : 0

        const delayedJobs = activityDetails.filter(a => a.atrasado && a.estado === 'completado').length
        const onTimeJobs = completedJobs - delayedJobs
        const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0

        // Mock profile structure
        const mockProfile = {
            id: worker.id,
            nombre: worker.nombre,
            rol: worker.rol,
            telefono: null,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as unknown as Profile


        return {
            worker: mockProfile,
            totalJobs,
            completedJobs,
            inProgressJobs,
            totalTimeHours,
            averageTimeHours,
            delayedJobs,
            onTimeJobs,
            completionRate,
            recentActivity: activityDetails
        }
    })

    return workersStats
}

export async function getWorkerActivityDetails(workerId: string): Promise<WorkerActivityDetail[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const workerHistory = MOCK_WORKER_HISTORY.filter(h => h.worker_id === workerId)
        .sort((a, b) => new Date(b.fecha_inicio_trabajo).getTime() - new Date(a.fecha_inicio_trabajo).getTime())

    return workerHistory.map((h) => {
        const service = MOCK_SERVICES.find(s => s.id === h.service_id)
        const vehicle = MOCK_VEHICLES.find(v => v.id === service?.vehicle_id)
        const customer = MOCK_CUSTOMERS.find(c => c.id === service?.customer_id)

        let tiempoHoras: number | null = null
        if (h.fecha_fin_trabajo && h.hora_fin_trabajo) {
            const startDateTime = new Date(`${h.fecha_inicio_trabajo}T${h.hora_inicio_trabajo}`)
            const endDateTime = new Date(`${h.fecha_fin_trabajo}T${h.hora_fin_trabajo}`)
            const diffMs = endDateTime.getTime() - startDateTime.getTime()
            tiempoHoras = diffMs / (1000 * 60 * 60)
        }

        let atrasado = false
        if (h.estado === 'completado' && h.fecha_fin_trabajo && service?.fecha_ingreso) {
            const fechaInicio = new Date(service.fecha_ingreso)
            const fechaFin = new Date(h.fecha_fin_trabajo)
            const diffTime = Math.abs(fechaFin.getTime() - fechaInicio.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            atrasado = diffDays > 3
        }

        return {
            id: h.id,
            service_id: h.service_id,
            service_number: service ? 1000 + parseInt(service.id.split('-')[1] || '0') : 0,
            vehicle_patente: vehicle?.patente || 'N/A',
            vehicle_marca: vehicle?.marca || 'N/A',
            vehicle_modelo: vehicle?.modelo || 'N/A',
            customer_name: customer?.nombre || 'N/A',
            worker_role: h.worker_role,
            fecha_inicio_trabajo: h.fecha_inicio_trabajo,
            hora_inicio_trabajo: h.hora_inicio_trabajo,
            fecha_fin_trabajo: h.fecha_fin_trabajo,
            hora_fin_trabajo: h.hora_fin_trabajo,
            fecha_estimada_finalizacion: null,
            estado: h.estado as 'en_proceso' | 'completado',
            tiempo_horas: tiempoHoras,
            tiempo_estimado_horas: null,
            atrasado,
            descripcion: null,
            evidencia_agregada: h.evidencia_agregada,
            reporte_rechazado: false
        }
    })
}
