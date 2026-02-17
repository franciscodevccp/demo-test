import { MOCK_SERVICES, MOCK_CUSTOMERS, MOCK_VEHICLES, MOCK_USERS, MOCK_COMMISSIONS } from '@/lib/mock-data'

export async function getDashboardStats() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Get current month's date range
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Filter services for this month
    const servicesThisMonth = MOCK_SERVICES.filter(s => {
        const fechaInicio = new Date(s.fecha_ingreso)
        return fechaInicio >= firstDayOfMonth
    })

    // Calculate stats
    const totalServicesMonth = servicesThisMonth.length
    const pendingServices = MOCK_SERVICES.filter(s => s.estado === 'pendiente').length
    const inProgressServices = MOCK_SERVICES.filter(s => ['en_proceso', 'en_progreso'].includes(s.estado)).length
    const completedServicesMonth = servicesThisMonth.filter(s => s.estado === 'completado').length

    // Calculate income this month (from completed services)
    const incomeThisMonth = servicesThisMonth
        .filter(s => s.estado === 'completado')
        .reduce((sum, s) => sum + (Number(s.costo_final) || Number(s.costo_estimado) || 0), 0)

    // Get pending commissions count
    const pendingCommissions = MOCK_COMMISSIONS.filter(c => c.estado === 'pendiente').length

    // Get total pending commission amount
    const pendingCommissionAmount = MOCK_COMMISSIONS.filter(c => c.estado === 'pendiente')
        .reduce((sum, c) => sum + (Number(c.monto_comision) || 0), 0)

    // Get counts for summary
    const totalClients = MOCK_CUSTOMERS.length
    const totalVehicles = MOCK_VEHICLES.length
    const totalWorkers = MOCK_USERS.filter(u => u.rol !== 'admin').length

    return {
        // Main stats
        totalServicesMonth,
        pendingServices,
        inProgressServices,
        completedServicesMonth,
        incomeThisMonth,

        // Alerts
        pendingCommissions,
        pendingCommissionAmount,

        // Summary counts
        totalClients,
        totalVehicles,
        totalWorkers,
    }
}

export async function getRecentServices(limit = 5) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const sortedServices = [...MOCK_SERVICES].sort((a, b) => new Date(b.fecha_ingreso).getTime() - new Date(a.fecha_ingreso).getTime())
    const limitedServices = sortedServices.slice(0, limit)

    return limitedServices.map(service => {
        const vehicle = MOCK_VEHICLES.find(v => v.id === service.vehicle_id)
        const customer = MOCK_CUSTOMERS.find(c => c.id === service.customer_id)

        return {
            id: service.id,
            numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
            estado: service.estado,
            fecha_inicio: service.fecha_ingreso,
            total: service.costo_final || service.costo_estimado,
            vehicle: vehicle ? {
                patente: vehicle.patente,
                marca: vehicle.marca,
                modelo: vehicle.modelo
            } : null,
            customer: customer ? {
                nombre: customer.nombre
            } : null
        }
    })
}
