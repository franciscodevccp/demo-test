import { MOCK_STATS } from '@/lib/mock-data'

export interface FinancialStats {
    // Ingresos
    totalIncome: number
    incomeThisMonth: number
    incomeLastMonth: number
    incomeThisYear: number

    // Gastos
    totalExpenses: number
    expensesThisMonth: number
    expensesLastMonth: number
    expensesThisYear: number

    // Desglose de gastos
    serviceExpenses: number
    serviceExpensesThisMonth: number
    salaryPayments: number
    salaryPaymentsThisMonth: number
    commissionsPaid: number
    commissionsPaidThisMonth: number

    // Ganancia
    totalProfit: number
    profitThisMonth: number
    profitLastMonth: number
    profitThisYear: number

    // Servicios
    totalServices: number
    completedServices: number
    completedServicesThisMonth: number
    completedServicesLastMonth: number

    // Otros
    pendingCommissions: number
    pendingCommissionsAmount: number
}

export async function getFinancialStatistics(): Promise<FinancialStats | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600))

    // Return static mock stats
    return {
        // Ingresos
        totalIncome: MOCK_STATS.ingresos_del_mes * 12,
        incomeThisMonth: MOCK_STATS.ingresos_del_mes,
        incomeLastMonth: MOCK_STATS.ingresos_del_mes * 0.9,
        incomeThisYear: MOCK_STATS.ingresos_del_mes * 12,

        // Gastos
        totalExpenses: MOCK_STATS.ingresos_del_mes * 0.5,
        expensesThisMonth: MOCK_STATS.ingresos_del_mes * 0.4,
        expensesLastMonth: MOCK_STATS.ingresos_del_mes * 0.45,
        expensesThisYear: MOCK_STATS.ingresos_del_mes * 0.5 * 12,

        // Desglose de gastos
        serviceExpenses: 500000,
        serviceExpensesThisMonth: 50000,
        salaryPayments: 1000000,
        salaryPaymentsThisMonth: 200000,
        commissionsPaid: 300000,
        commissionsPaidThisMonth: 50000,

        // Ganancia
        totalProfit: MOCK_STATS.ingresos_del_mes * 0.6,
        profitThisMonth: MOCK_STATS.ingresos_del_mes * 0.6,
        profitLastMonth: MOCK_STATS.ingresos_del_mes * 0.55,
        profitThisYear: MOCK_STATS.ingresos_del_mes * 0.6 * 12,

        // Servicios
        totalServices: MOCK_STATS.vehiculos_totales * 2,
        completedServices: MOCK_STATS.vehiculos_totales,
        completedServicesThisMonth: 5,
        completedServicesLastMonth: 4,

        // Otros
        pendingCommissions: 2,
        pendingCommissionsAmount: 150000,
    }
}
