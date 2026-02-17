import { MOCK_WORKER_HISTORY, MOCK_COMMISSIONS } from '@/lib/mock-data'

export interface WorkerDashboardStats {
    pendingJobs: number
    completedJobsThisMonth: number
    pendingCommissionsAmount: number
}

export async function getWorkerDashboardStats(workerId: string): Promise<WorkerDashboardStats | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    // Get current month's date range
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get pending jobs (en_proceso)
    const pendingJobs = MOCK_WORKER_HISTORY.filter(h => h.worker_id === workerId && h.estado === 'en_proceso').length

    // Get completed jobs this month
    const completedJobsThisMonth = MOCK_WORKER_HISTORY.filter(job => {
        if (job.worker_id !== workerId || job.estado !== 'completado') return false
        if (!job.fecha_fin_trabajo) return false
        const fechaFin = new Date(job.fecha_fin_trabajo)
        return fechaFin >= firstDayOfMonth
    }).length

    // Get pending commissions for this worker
    const pendingCommissionsAmount = MOCK_COMMISSIONS.filter(c => c.worker_id === workerId && c.estado === 'pendiente')
        .reduce((sum, c) => sum + (c.monto_comision || 0), 0)

    return {
        pendingJobs,
        completedJobsThisMonth,
        pendingCommissionsAmount,
    }
}

