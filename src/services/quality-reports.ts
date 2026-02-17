import { MOCK_QUALITY_REPORTS, MOCK_SERVICES, MOCK_VEHICLES, MOCK_CUSTOMERS, MOCK_USERS } from '@/lib/mock-data'
import type { QualityReport, Profile, Service, Vehicle, Customer } from '@/types/database'

export interface QualityReportWithRelations extends QualityReport {
    service: Service & {
        vehicle: Vehicle & {
            customer: Customer
        }
    }
    worker: Profile
    aprobado_por?: Profile | null
    rechazado_por?: Profile | null
}

export async function getQualityReports(status?: 'pendiente' | 'aprobado' | 'rechazado' | 'all') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 400))

    let reports = MOCK_QUALITY_REPORTS
    if (status && status !== 'all') {
        reports = reports.filter(r => r.estado === status)
    }

    return reports.map(report => {
        const service = MOCK_SERVICES.find(s => s.id === report.service_id)
        const worker = MOCK_USERS.find(u => u.id === report.worker_id)
        const aprobador = MOCK_USERS.find(u => u.id === report.aprobado_por_id)
        const rechazador = MOCK_USERS.find(u => u.id === report.rechazado_por_id)

        const vehicle = MOCK_VEHICLES.find(v => v.id === service?.vehicle_id)
        const customer = MOCK_CUSTOMERS.find(c => c.id === service?.customer_id)

        // Simplified mock objects
        const mockProfile = (u: any) => u ? ({ ...u, telefono: null, activo: true, created_at: '', updated_at: '' } as unknown as Profile) : null

        const mockService = service ? {
            ...service,
            id: service.id,
            numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
            estado: service.estado,
            fecha_inicio: service.fecha_ingreso,
            vehicle: vehicle ? { ...vehicle, customer: customer } : null
        } : null

        return {
            ...report,
            service: mockService,
            worker: mockProfile(worker),
            aprobado_por: mockProfile(aprobador),
            rechazado_por: mockProfile(rechazador)
        } as unknown as QualityReportWithRelations
    })
}

export async function getQualityReportById(id: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const report = MOCK_QUALITY_REPORTS.find(r => r.id === id)

    if (!report) return null

    const service = MOCK_SERVICES.find(s => s.id === report.service_id)
    const worker = MOCK_USERS.find(u => u.id === report.worker_id)
    const aprobador = MOCK_USERS.find(u => u.id === report.aprobado_por_id)
    const rechazador = MOCK_USERS.find(u => u.id === report.rechazado_por_id)

    const vehicle = MOCK_VEHICLES.find(v => v.id === service?.vehicle_id)
    const customer = MOCK_CUSTOMERS.find(c => c.id === service?.customer_id)

    // Simplified mock objects
    const mockProfile = (u: any) => u ? ({ ...u, telefono: null, activo: true, created_at: '', updated_at: '' } as unknown as Profile) : null

    const mockService = service ? {
        ...service,
        id: service.id,
        numero_servicio: 1000 + parseInt(service.id.split('-')[1] || '0'),
        estado: service.estado,
        fecha_inicio: service.fecha_ingreso,
        vehicle: vehicle ? { ...vehicle, customer: customer } : null
    } : null

    return {
        ...report,
        service: mockService,
        worker: mockProfile(worker),
        aprobado_por: mockProfile(aprobador),
        rechazado_por: mockProfile(rechazador)
    } as unknown as QualityReportWithRelations
}

