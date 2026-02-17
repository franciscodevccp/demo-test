// ============================================
// Database Types for Innovautos
// ============================================

// User Roles
export type UserRole =
    | 'admin'
    | 'mecanico'
    | 'pintor'
    | 'desabolladura'
    | 'preparacion'
    | 'armado'
    | 'lavado'
    | 'pulido'
    | 'calidad'
    | 'sistema_calidad'

// Service Status
export type ServiceStatus = 'pendiente' | 'en_proceso' | 'completado' | 'cancelado'

// Commission Status
export type CommissionStatus = 'pendiente' | 'pagada' | 'cancelada'

// Worker History Status
export type WorkerHistoryStatus = 'en_proceso' | 'completado'

// Quality Report Status
export type QualityReportStatus = 'pendiente' | 'aprobado' | 'rechazado'

// ============================================
// Table Types
// ============================================

export interface Profile {
    id: string
    nombre: string
    rol: UserRole
    telefono: string | null
    activo: boolean
    created_at: string
    updated_at: string
}

export interface Customer {
    id: string
    nombre: string
    rut: string | null
    telefono: string | null
    email: string | null
    direccion: string | null
    created_at: string
    updated_at: string
}

export interface Vehicle {
    id: string
    customer_id: string
    patente: string
    marca: string
    modelo: string
    año: number | null
    color: string | null
    kilometraje: number | null
    created_at: string
    updated_at: string
}

export interface Service {
    id: string
    numero_servicio: number
    vehicle_id: string
    customer_id: string
    mechanic_id: string | null
    completed_by_id: string | null
    cancelled_by_id: string | null
    fecha_inicio: string
    hora_inicio: string
    fecha_estimada_finalizacion: string | null
    fecha_fin: string | null
    hora_fin: string | null
    fecha_inicio_trabajo: string | null
    hora_inicio_trabajo: string | null
    fecha_fin_trabajo: string | null
    hora_fin_trabajo: string | null
    estado: ServiceStatus
    descripcion_inicial: string | null
    diagnostico: string | null
    trabajos_realizados: string | null
    repuestos_utilizados: string | null
    observaciones_finales: string | null
    total: number | null
    created_at: string
    updated_at: string
    evidencia_inicial?: string | null
}

export interface ServiceTask {
    id: string
    service_id: string
    descripcion: string
    tiempo_estimado_minutos: number | null
    costo_mano_obra: number | null
    panos: number | null
    completado: boolean
    created_at: string
    updated_at: string
}

export interface ServicePart {
    id: string
    service_id: string
    nombre_repuesto: string
    cantidad: number
    precio_unitario: number
    precio_total: number
    codigo_parte: string | null
    created_at: string
}

export interface ServiceExpense {
    id: string
    service_id: string
    descripcion: string
    monto: number
    created_at: string
    updated_at: string
}

export interface ServiceWorkerHistory {
    id: string
    service_id: string
    worker_id: string
    worker_role: string
    estado: WorkerHistoryStatus
    descripcion: string | null
    evidencia: string[] | null
    fecha_inicio_trabajo: string
    hora_inicio_trabajo: string
    fecha_fin_trabajo: string | null
    hora_fin_trabajo: string | null
    evidencia_agregada: boolean
    evidencia_imagenes: string[] | null
    reporte_rechazado: boolean
    created_at: string
    updated_at: string
}

export interface WorkerCommission {
    id: string
    service_id: string
    worker_id: string | null
    worker_role: UserRole | null
    monto_base: number | null
    porcentaje: number | null
    monto_comision: number | null
    estado: CommissionStatus
    created_at: string
    updated_at: string
}

export interface WorkerPano {
    id: string
    worker_id: string
    service_id: string
    task_id: string
    cantidad_panos: number
    fecha_asignacion: string
    created_at: string
}

export type SalaryPaymentType = 'comision' | 'panos'

export interface SalaryPayment {
    id: string
    worker_id: string
    tipo_pago: SalaryPaymentType
    monto: number
    cantidad_panos: number | null
    precio_pano: number | null
    fecha_pago: string
    descripcion: string | null
    comprobante_imagenes: string[]
    created_by_id: string
    created_at: string
    updated_at: string
}

export interface QualityReport {
    id: string
    service_id: string
    worker_id: string
    descripcion: string
    observaciones: string | null
    imagenes: string[]
    estado: QualityReportStatus
    razon_rechazo: string | null
    aprobado_por_id: string | null
    rechazado_por_id: string | null
    fecha_aprobacion: string | null
    fecha_rechazo: string | null
    created_at: string
    updated_at: string
}

export interface Note {
    id: string
    service_id: string
    worker_id: string
    titulo: string
    contenido: string
    created_at: string
    updated_at: string
}
