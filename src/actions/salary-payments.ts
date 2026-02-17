'use server'

import { revalidatePath } from 'next/cache'
import { MOCK_USERS, MOCK_COMMISSIONS, MOCK_PANOS } from '@/lib/mock-data'

export async function createSalaryPayment(data: any): Promise<{ success: boolean; error?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`Mock Create Salary Payment:`, data)

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
        rol: u.rol as any // Cast to any to avoid type error with 'trabajador' mock role
    }))

    return workers.map((worker) => ({
        ...worker,
        telefono: null,
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }))
}

export async function getWorkerPaymentData(workerId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const worker = MOCK_USERS.find(u => u.id === workerId)

    if (!worker) {
        throw new Error('Trabajador no encontrado')
    }

    // Get unpaid commissions
    const commissions = MOCK_COMMISSIONS.filter(c =>
        c.worker_id === workerId && c.estado === 'pendiente'
    ).map(c => ({
        ...c,
        worker_role: c.worker_role as any,
        estado: c.estado as any
    }))

    // Get unpaid panos
    const panos = (MOCK_PANOS as any[]).filter(p =>
        p.worker_id === workerId && p.estado === 'pendiente'
    )

    return {
        worker: {
            id: worker.id,
            nombre: worker.nombre,
            rol: worker.rol as any,
            telefono: null,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        commissions: commissions || [],
        panos: panos || []
    }
}
