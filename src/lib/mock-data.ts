
export const MOCK_USERS = [
    {
        id: 'user-admin-123',
        email: 'admin@innovautos.cl',
        password: 'admin', // In a real app never store plan text passwords, but this is a mock
        rol: 'admin',
        nombre: 'Administrador Demo'
    },
    {
        id: 'user-mecanico-1',
        email: 'mecanico@innovautos.cl',
        password: '123',
        rol: 'mecanico',
        nombre: 'Juan Mecánico',
        telefono: '+569 1111 1111',
        activo: true
    },
    {
        id: 'user-lavado-1',
        email: 'lavado@innovautos.cl',
        password: '123',
        rol: 'lavado',
        nombre: 'Pedro Lavado',
        telefono: '+569 2222 2222',
        activo: true
    },
    {
        id: 'user-pintor-1',
        email: 'pintor@innovautos.cl',
        password: '123',
        rol: 'pintor',
        nombre: 'Ana Pintora',
        telefono: '+569 3333 3333',
        activo: true
    },
    {
        id: 'user-calidad-1',
        email: 'calidad@innovautos.cl',
        password: '123',
        rol: 'sistema_calidad',
        nombre: 'Carlos Calidad',
        telefono: '+569 4444 4444',
        activo: true
    }
]

export const MOCK_CUSTOMERS = [
    {
        id: 'cust-1',
        nombre: 'Juan Pérez',
        email: 'juan.perez@email.com',
        telefono: '+56912345678',
        rut: '12.345.678-9',
        direccion: 'Av. Siempre Viva 123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'cust-2',
        nombre: 'María González',
        email: 'maria.gonzalez@email.com',
        telefono: '+56987654321',
        rut: '98.765.432-1',
        direccion: 'Calle Falsa 123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

export const MOCK_VEHICLES = [
    {
        id: 'veh-1',
        patente: 'ABCD12',
        marca: 'Toyota',
        modelo: 'Corolla',
        color: 'Blanco',
        año: 2020,
        kilometraje: 45000,
        customer_id: 'cust-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'veh-2',
        patente: 'XYZA98',
        marca: 'Mazda',
        modelo: '3',
        color: 'Rojo',
        año: 2022,
        kilometraje: 15000,
        customer_id: 'cust-2',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

export const MOCK_SERVICES = [
    {
        id: 'svc-1',
        estado: 'en_progreso',
        fecha_ingreso: new Date().toISOString(),
        fecha_termino: null,
        vehicle_id: 'veh-1',
        customer_id: 'cust-1',
        tipo_servicio: 'Mantenimiento General',
        descripcion: 'Cambio de aceite y filtros',
        costo_estimado: 150000,
        costo_final: null,
        trabajador_id: 'user-worker-123',
        evidencia_inicial: null,
        observaciones_finales: null,
        diagnostico: null,
        trabajos_realizados: null,
        repuestos_utilizados: null
    },
    {
        id: 'svc-2',
        estado: 'completado',
        fecha_ingreso: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
        fecha_termino: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        vehicle_id: 'veh-2',
        customer_id: 'cust-2',
        tipo_servicio: 'Lavado Full',
        descripcion: 'Lavado interior y exterior',
        costo_estimado: 25000,
        costo_final: 25000,
        trabajador_id: 'user-worker-123',
        evidencia_inicial: null,
        observaciones_finales: null,
        diagnostico: null,
        trabajos_realizados: null,
        repuestos_utilizados: null
    },
    {
    id: 'svc-3',
        estado: 'pendiente',
            fecha_ingreso: new Date().toISOString(),
                fecha_termino: null,
                    vehicle_id: 'veh-1',
                        customer_id: 'cust-1',
                            tipo_servicio: 'Revisión Frenos',
                                descripcion: 'Ruidos al frenar, revisar pastillas y discos',
                                    costo_estimado: 45000,
                                        costo_final: null,
                                            trabajador_id: 'user-mecanico-1',
                                                evidencia_inicial: null,
                                                    observaciones_finales: null,
                                                        diagnostico: null,
                                                            trabajos_realizados: null,
                                                                repuestos_utilizados: null
}
]

export const MOCK_WORKERS = []

export const MOCK_STATS = {
    clientes_totales: MOCK_CUSTOMERS.length,
    vehiculos_totales: MOCK_VEHICLES.length,
    servicios_activos: MOCK_SERVICES.filter(s => s.estado === 'en_progreso').length,
    ingresos_del_mes: 2500000
}

export const MOCK_WORKER_HISTORY = [
    {
        id: 'hist-1',
        service_id: 'svc-1',
        worker_id: 'user-worker-123',
        worker_role: 'mecanico',
        estado: 'en_proceso',
        evidencia: null,
        evidencia_imagenes: [],
        fecha_inicio_trabajo: new Date().toISOString(),
        hora_inicio_trabajo: '10:00',
        fecha_fin_trabajo: null,
        hora_fin_trabajo: null,
        evidencia_agregada: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

export const MOCK_PARTS = [
    {
        id: 'part-1',
        service_id: 'svc-1',
        nombre_repuesto: 'Filtro de Aceite',
        cantidad: 1,
        precio_unitario: 15000,
        precio_total: 15000,
        codigo_parte: 'FIL-001',
        created_at: new Date().toISOString()
    }
]

export const MOCK_COMMISSIONS = [
    {
        id: 'comm-1',
        service_id: 'svc-2',
        worker_id: 'user-lavado-1',
        worker_role: 'lavado',
        monto_base: 25000,
        porcentaje: 40,
        monto_comision: 10000,
        estado: 'pagada',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'comm-2',
        service_id: 'svc-1',
        worker_id: 'user-mecanico-1',
        worker_role: 'mecanico',
        monto_base: 150000,
        porcentaje: 30,
        monto_comision: 45000,
        estado: 'pendiente',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]

export const MOCK_PANOS = []

export const MOCK_SALARY_PAYMENTS = [
    {
        id: 'pay-1',
        worker_id: 'user-lavado-1',
        tipo_pago: 'comision',
        monto: 250000,
        cantidad_panos: null,
        precio_pano: null,
        fecha_pago: new Date(Date.now() - 86400000 * 10).toISOString(),
        descripcion: 'Pago comisiones semana anterior',
        comprobante_imagenes: [],
        created_by_id: 'user-admin-123',
        created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 10).toISOString()
    },
    {
        id: 'pay-2',
        worker_id: 'user-mecanico-1',
        tipo_pago: 'sueldo_base',
        monto: 500000,
        cantidad_panos: null,
        precio_pano: null,
        fecha_pago: new Date(Date.now() - 86400000 * 5).toISOString(),
        descripcion: 'Adelanto de sueldo',
        comprobante_imagenes: [],
        created_by_id: 'user-admin-123',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
    }
]

export const MOCK_QUALITY_REPORTS = [
    {
        id: 'qr-1',
        service_id: 'svc-1',
        worker_id: 'user-mecanico-1',
        aprobado_por_id: 'user-admin-123',
        rechazado_por_id: null,
        estado: 'aprobado',
        comentarios: 'Buen trabajo, todo limpio.',
        calificacion: 5,
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 1).toISOString()
    },
    {
        id: 'qr-2',
        service_id: 'svc-2',
        worker_id: 'user-lavado-1',
        aprobado_por_id: null,
        rechazado_por_id: null,
        estado: 'pendiente',
        comentarios: null,
        calificacion: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
]





