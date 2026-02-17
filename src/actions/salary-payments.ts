'use server'

import { revalidatePath } from 'next/cache'
import { MOCK_USERS, MOCK_COMMISSIONS, MOCK_PANOS } from '@/lib/mock-data'

export async function createSalaryPayment(workerId: string, rawData: any) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`Mock Create Salary Payment for Worker ${workerId}:`, rawData)

    revalidatePath('/admin/pagos')
    return { success: true }
}

export async function searchWorkersForPayment(query: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!query) return []

    const workers = MOCK_USERS.filter(u =>
        u.rol !== 'admin' &&
        u.nombre.toLowerCase().includes(query.toLowerCase())
    ).map(u => ({
        id: u.id,
        nombre: u.nombre,
        rol: u.rol
    }))

    return workers
}

export async function getWorkerPaymentData(workerId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const worker = MOCK_USERS.find(u => u.id === workerId)

    if (!worker) {
        return { error: 'Trabajador no encontrado' }
    }

    // Get unpaid commissions
    const commissions = MOCK_COMMISSIONS.filter(c =>
        c.worker_id === workerId && c.estado === 'pendiente'
    )

    // Get unpaid panos
    const panos = (MOCK_PANOS as any[]).filter(p =>
        p.worker_id === workerId && p.estado === 'pendiente'
    )

    return {
        worker: {
            id: worker.id,
            nombre: worker.nombre,
            rol: worker.rol
        },
        commissions,
        panos
    }
}
