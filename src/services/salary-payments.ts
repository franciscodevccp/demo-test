import { MOCK_SALARY_PAYMENTS, MOCK_USERS } from '@/lib/mock-data'
import type { SalaryPayment, Profile } from '@/types/database'

export interface SalaryPaymentWithRelations extends SalaryPayment {
    worker: Profile
    created_by: Profile
}

export async function getSalaryPayments(orderBy: 'recientes' | 'antiguos' = 'recientes') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400))

    const payments = [...MOCK_SALARY_PAYMENTS].sort((a, b) => {
        const dateA = new Date(a.fecha_pago).getTime()
        const dateB = new Date(b.fecha_pago).getTime()
        return orderBy === 'antiguos' ? dateA - dateB : dateB - dateA
    })

    return payments.map(payment => {
        const worker = MOCK_USERS.find(u => u.id === payment.worker_id)
        const creator = MOCK_USERS.find(u => u.id === payment.created_by_id)

        // Mock profile structure since MOCK_USERS structure is slightly different
        const mockProfile = (u: any) => ({
            id: u?.id || '',
            nombre: u?.nombre || 'Unknown',
            rol: u?.rol || 'trabajador',
            telefono: null,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as Profile)

        return {
            ...payment,
            worker: mockProfile(worker),
            created_by: mockProfile(creator)
        }
    }) as SalaryPaymentWithRelations[]
}

export async function getSalaryPaymentsByWorker(workerId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const payments = MOCK_SALARY_PAYMENTS.filter(p => p.worker_id === workerId)
        .sort((a, b) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime())

    return payments.map(payment => {
        const worker = MOCK_USERS.find(u => u.id === payment.worker_id)
        const creator = MOCK_USERS.find(u => u.id === payment.created_by_id)

        const mockProfile = (u: any) => ({
            id: u?.id || '',
            nombre: u?.nombre || 'Unknown',
            rol: u?.rol || 'trabajador',
            telefono: null,
            activo: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        } as Profile)

        return {
            ...payment,
            worker: mockProfile(worker),
            created_by: mockProfile(creator)
        }
    }) as SalaryPaymentWithRelations[]
}

