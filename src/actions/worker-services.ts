'use server'

import { revalidatePath } from 'next/cache'
import { ServiceTask } from '@/types/database'

export async function startService(serviceId: string, workerId: string, workerRole: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Mock Start Service ${serviceId} for Worker ${workerId} (${workerRole})`)
    revalidatePath('/trabajador/servicios')
    return { success: true }
}

export async function acceptService(serviceId: string, workerRole: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Mock Accept Service ${serviceId} for role ${workerRole}`)
    revalidatePath('/trabajador/servicios')
    return { success: true }
}

export async function getServiceTasksWithPanosAction(serviceId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Mock Get Service Tasks for ${serviceId}`)

    // Return mock tasks
    const tasks: ServiceTask[] = [
        {
            id: 'mock-task-1',
            service_id: serviceId,
            descripcion: 'Limpieza exterior con paños',
            tiempo_estimado_minutos: 30,
            costo_mano_obra: 5000,
            panos: 2,
            completado: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 'mock-task-2',
            service_id: serviceId,
            descripcion: 'Revisión general',
            tiempo_estimado_minutos: 15,
            costo_mano_obra: 2000,
            panos: 0,
            completado: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ]

    return { tasks }
}

export async function completeWorkerService(
    serviceId: string,
    workerRole: string,
    data: {
        descripcion: string
        imagenes?: string[]
        videos?: string[]
        panos?: Array<{ task_id: string; cantidad: number }>
    }
) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Mock Complete Worker Service ${serviceId} (${workerRole}):`, data)
    revalidatePath('/trabajador/servicios')
    revalidatePath('/trabajador/historial')
    revalidatePath(`/trabajador/servicios/${serviceId}`)
    return { success: true }
}

export async function completeService(historyId: string, serviceId: string, workerId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Mock Complete Service History ${historyId}`)
    revalidatePath('/trabajador/servicios')
    revalidatePath('/trabajador/historial')
    revalidatePath(`/trabajador/servicios/${serviceId}`)
    return { success: true }
}

export async function uploadEvidence(historyId: string, formData: FormData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Mock Upload Evidence for History ${historyId}`)
    // Mock file upload handling
    const files = formData.getAll('files')
    console.log(`Uploaded ${files.length} files`)

    revalidatePath(`/trabajador/servicios`)
    return { success: true }
}

export async function addPartToService(serviceId: string, formData: FormData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const partData = {
        nombre_repuesto: formData.get('nombre_repuesto'),
        cantidad: formData.get('cantidad'),
        precio_unitario: formData.get('precio_unitario'),
        codigo_parte: formData.get('codigo_parte')
    }
    console.log(`Mock Add Part to Service ${serviceId}:`, partData)

    revalidatePath(`/trabajador/servicios`)
    return { success: true }
}

export async function updateServiceCosts(serviceId: string, formData: FormData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const costData = {
        costo_final: formData.get('costo_final')
    }
    console.log(`Mock Update Service Costs ${serviceId}:`, costData)

    revalidatePath(`/trabajador/servicios`)
    return { success: true }
}
