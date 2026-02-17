'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

interface TaskData {
    descripcion: string
    costo_mano_obra: number
    panos: number
}

interface PartData {
    nombre_repuesto: string
    cantidad: number
    precio_unitario: number
}

interface ExpenseData {
    descripcion: string
    monto: number
}

interface CommissionData {
    worker_role: string
    monto_base: number
    porcentaje: number
    monto_comision: number
}

export async function createService(data: {
    vehicleId: string
    customerId: string
    descripcionInicial: string
    fechaInicio: string
    horaInicio: string
    fechaEstimada: string | null
    tasks: TaskData[]
    parts: PartData[]
    expenses: ExpenseData[]
    commissions: CommissionData[]
    evidenciaImagenes?: string[]
    evidenciaVideos?: string[]
}) {
    const supabase = await createClient()

    if (!data.vehicleId || !data.customerId || !data.fechaInicio || !data.horaInicio) {
        return { error: 'Vehículo, cliente, fecha y hora de inicio son requeridos' }
    }

    // Get next service number
    const { data: lastService } = await supabase
        .from('services')
        .select('numero_servicio')
        .order('numero_servicio', { ascending: false })
        .limit(1)
        .single()

    const nextNumber = (lastService?.numero_servicio || 0) + 1

    // Calculate total
    const tasksTotal = data.tasks.reduce((sum, task) => sum + (task.costo_mano_obra || 0), 0)
    const partsTotal = data.parts.reduce((sum, part) => sum + (part.precio_unitario * part.cantidad), 0)
    const expensesTotal = data.expenses.reduce((sum, expense) => sum + (expense.monto || 0), 0)
    const total = tasksTotal + partsTotal + expensesTotal

    // Prepare service data with evidencia_inicial as JSONB
    const serviceData: any = {
        numero_servicio: nextNumber,
        vehicle_id: data.vehicleId,
        customer_id: data.customerId,
        descripcion_inicial: data.descripcionInicial || null,
        fecha_inicio: data.fechaInicio,
        hora_inicio: data.horaInicio,
        fecha_estimada_finalizacion: data.fechaEstimada || null,
        estado: 'pendiente',
        total: total,
    }

    // Add evidencia_inicial if images or videos are provided
    if ((data.evidenciaImagenes && data.evidenciaImagenes.length > 0) ||
        (data.evidenciaVideos && data.evidenciaVideos.length > 0)) {
        serviceData.evidencia_inicial = JSON.stringify({
            imagenes: data.evidenciaImagenes || [],
            videos: data.evidenciaVideos || [],
            fecha: new Date().toISOString()
        })
    }

    // Create service
    const { data: service, error: serviceError } = await supabase
        .from('services')
        .insert(serviceData)
        .select('id')
        .single()

    if (serviceError) {
        console.error('Error creating service:', serviceError)
        return { error: serviceError.message }
    }

    // Insert tasks if any
    if (data.tasks.length > 0) {
        const tasksToInsert = data.tasks.map(task => ({
            service_id: service.id,
            descripcion: task.descripcion,
            costo_mano_obra: task.costo_mano_obra || 0,
            panos: task.panos || 0,
            completado: false,
        }))

        const { error: tasksError } = await supabase
            .from('service_tasks')
            .insert(tasksToInsert)

        if (tasksError) {
            console.error('Error creating tasks:', tasksError)
        }
    }

    // Insert parts if any
    if (data.parts.length > 0) {
        const partsToInsert = data.parts.map(part => ({
            service_id: service.id,
            nombre_repuesto: part.nombre_repuesto,
            cantidad: part.cantidad,
            precio_unitario: part.precio_unitario,
            // precio_total is a generated column, don't insert it
        }))

        const { error: partsError } = await supabase
            .from('service_parts')
            .insert(partsToInsert)

        if (partsError) {
            console.error('Error creating parts:', partsError)
        }
    }

    // Insert expenses if any
    if (data.expenses.length > 0) {
        const expensesToInsert = data.expenses.map(expense => ({
            service_id: service.id,
            descripcion: expense.descripcion,
            monto: expense.monto,
        }))

        const { error: expensesError } = await supabase
            .from('service_expenses')
            .insert(expensesToInsert)

        if (expensesError) {
            console.error('Error creating expenses:', expensesError)
        }
    }

    // Insert commissions if any
    if (data.commissions.length > 0) {
        const commissionsToInsert = data.commissions.map(commission => ({
            service_id: service.id,
            worker_role: commission.worker_role,
            monto_base: commission.monto_base,
            porcentaje: commission.porcentaje,
            monto_comision: commission.monto_comision,
            estado: 'pendiente',
            worker_id: null, // Will be assigned later when worker accepts
        }))

        const { error: commissionsError } = await supabase
            .from('worker_commissions')
            .insert(commissionsToInsert)

        if (commissionsError) {
            console.error('Error creating commissions:', commissionsError)
        }
    }

    // Trigger an UPDATE to ensure Realtime events are fired
    // This helps with Realtime subscriptions that might miss INSERT events
    await new Promise(resolve => setTimeout(resolve, 500))

    await supabase
        .from('services')
        .update({
            updated_at: new Date().toISOString(),
            estado: 'pendiente'
        })
        .eq('id', service.id)

    revalidatePath('/admin/servicios')
    redirect(`/admin/servicios/${service.id}`)
}

export async function updateService(serviceId: string, data: {
    descripcionInicial: string
    fechaInicio: string
    horaInicio: string
    fechaEstimada: string | null
    tasks: TaskData[]
    parts: PartData[]
    expenses: ExpenseData[]
    commissions: CommissionData[]
}) {
    const supabase = await createClient()

    // Calculate totals
    const tasksTotal = data.tasks.reduce((sum, t) => sum + (t.costo_mano_obra || 0), 0)
    const partsTotal = data.parts.reduce((sum, p) => sum + (p.cantidad * p.precio_unitario), 0)
    const expensesTotal = data.expenses.reduce((sum, e) => sum + (e.monto || 0), 0)
    const totalService = tasksTotal + partsTotal + expensesTotal

    // Update service basic info
    const { error: serviceError } = await supabase
        .from('services')
        .update({
            descripcion_inicial: data.descripcionInicial || null,
            fecha_inicio: data.fechaInicio,
            hora_inicio: data.horaInicio,
            fecha_estimada_finalizacion: data.fechaEstimada || null,
            total: totalService,
        })
        .eq('id', serviceId)

    if (serviceError) {
        console.error('Error updating service:', serviceError)
        return { error: 'Error al actualizar el servicio' }
    }

    // Delete existing tasks, parts, expenses
    // Note: Only delete unassigned commissions (worker_id is null)
    // to preserve commissions that have already been assigned to workers

    // First, delete worker_panos that reference tasks from this service
    // This is necessary because worker_panos has a foreign key to service_tasks
    const { error: deleteWorkerPanosError } = await supabase
        .from('worker_panos')
        .delete()
        .eq('service_id', serviceId)

    if (deleteWorkerPanosError) {
        console.error('Error deleting worker_panos:', deleteWorkerPanosError)
        return { error: 'Error al eliminar registros de paños asociados' }
    }

    // Now we can safely delete the tasks
    const { error: deleteTasksError } = await supabase.from('service_tasks').delete().eq('service_id', serviceId)
    if (deleteTasksError) {
        console.error('Error deleting tasks:', deleteTasksError)
        return { error: 'Error al eliminar tareas existentes' }
    }

    const { error: deletePartsError } = await supabase.from('service_parts').delete().eq('service_id', serviceId)
    if (deletePartsError) {
        console.error('Error deleting parts:', deletePartsError)
        return { error: 'Error al eliminar repuestos existentes' }
    }

    const { error: deleteExpensesError } = await supabase.from('service_expenses').delete().eq('service_id', serviceId)
    if (deleteExpensesError) {
        console.error('Error deleting expenses:', deleteExpensesError)
        return { error: 'Error al eliminar costos existentes' }
    }

    // Only delete unassigned commissions (worker_id is null)
    const { error: deleteCommissionsError } = await supabase
        .from('worker_commissions')
        .delete()
        .eq('service_id', serviceId)
        .is('worker_id', null)

    if (deleteCommissionsError) {
        console.error('Error deleting unassigned commissions:', deleteCommissionsError)
        return { error: 'Error al eliminar comisiones no asignadas' }
    }

    // Re-insert tasks
    if (data.tasks.length > 0) {
        const tasksToInsert = data.tasks.map(task => ({
            service_id: serviceId,
            descripcion: task.descripcion,
            costo_mano_obra: task.costo_mano_obra,
            panos: task.panos,
            completado: false,
        }))

        const { error: tasksError } = await supabase
            .from('service_tasks')
            .insert(tasksToInsert)

        if (tasksError) {
            console.error('Error creating tasks:', tasksError)
            return { error: 'Error al crear las tareas' }
        }
    }

    // Re-insert parts
    console.log('🔍 Parts data received:', data.parts)
    console.log('🔍 Parts length:', data.parts.length)

    if (data.parts.length > 0) {
        const partsToInsert = data.parts.map(part => ({
            service_id: serviceId,
            nombre_repuesto: part.nombre_repuesto,
            cantidad: part.cantidad,
            precio_unitario: part.precio_unitario,
            // precio_total is a generated column, don't insert it
        }))

        console.log('🔍 Parts to insert:', partsToInsert)

        const { data: insertedParts, error: partsError } = await supabase
            .from('service_parts')
            .insert(partsToInsert)
            .select()

        if (partsError) {
            console.error('❌ Error creating parts:', partsError)
        } else {
            console.log('✅ Parts inserted successfully:', insertedParts)
        }
    } else {
        console.log('⚠️ No parts to insert - parts array is empty')
    }

    // Re-insert expenses
    if (data.expenses.length > 0) {
        const expensesToInsert = data.expenses.map(expense => ({
            service_id: serviceId,
            descripcion: expense.descripcion,
            monto: expense.monto,
        }))

        const { error: expensesError } = await supabase
            .from('service_expenses')
            .insert(expensesToInsert)

        if (expensesError) {
            console.error('Error creating expenses:', expensesError)
        }
    }

    // Re-insert commissions (only if they don't already exist for the role)
    if (data.commissions.length > 0) {
        // Get existing commissions for this service to check for duplicates
        const { data: existingCommissions } = await supabase
            .from('worker_commissions')
            .select('worker_role, worker_id')
            .eq('service_id', serviceId)

        const existingRoles = new Set(
            (existingCommissions || []).map((c: any) => c.worker_role)
        )

        // Filter out commissions that already exist (for assigned workers)
        // and only insert new or unassigned commissions
        const commissionsToInsert = data.commissions
            .filter(commission => {
                // If commission exists and is assigned, skip it
                if (existingRoles.has(commission.worker_role)) {
                    const existing = existingCommissions?.find(
                        (c: any) => c.worker_role === commission.worker_role && c.worker_id !== null
                    )
                    return !existing // Only insert if it's not assigned
                }
                return true // Insert if role doesn't exist
            })
            .map(commission => ({
                service_id: serviceId,
                worker_role: commission.worker_role,
                monto_base: commission.monto_base,
                porcentaje: commission.porcentaje,
                monto_comision: commission.monto_comision,
                estado: 'pendiente',
                worker_id: null,
            }))

        if (commissionsToInsert.length > 0) {
            const { error: commissionsError } = await supabase
                .from('worker_commissions')
                .insert(commissionsToInsert)

            if (commissionsError) {
                console.error('Error creating commissions:', commissionsError)
                // Don't return error here, just log it as commissions might already exist
            }
        }
    }

    revalidatePath('/admin/servicios')
    revalidatePath(`/admin/servicios/${serviceId}`)
    redirect(`/admin/servicios/${serviceId}`)
}

export async function searchVehicleByPatente(patente: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('vehicles')
        .select(`
      id,
      patente,
      marca,
      modelo,
      "año",
      color,
      kilometraje,
      customer_id,
      customers(id, nombre, telefono, email)
    `)
        .ilike('patente', `%${patente}%`)
        .limit(5)

    if (error) {
        console.error('Error searching vehicle:', error)
        return []
    }

    return (data || []).map((v: any) => ({
        id: v.id,
        patente: v.patente,
        marca: v.marca,
        modelo: v.modelo,
        año: v.año,
        color: v.color,
        kilometraje: v.kilometraje,
        customer_id: v.customer_id,
        customer: Array.isArray(v.customers) ? v.customers[0] : v.customers,
    }))
}

export async function startService(serviceId: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'No autorizado' }
    }

    // Get user profile to check if admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()

    if (profileError || !profile || profile.rol !== 'admin') {
        return { error: 'Solo los administradores pueden iniciar servicios' }
    }

    const now = new Date()
    const fechaInicioTrabajo = now.toISOString().split('T')[0]
    const horaInicioTrabajo = now.toTimeString().slice(0, 5)

    const { error } = await supabase
        .from('services')
        .update({
            estado: 'en_proceso',
            fecha_inicio_trabajo: fechaInicioTrabajo,
            hora_inicio_trabajo: horaInicioTrabajo,
        })
        .eq('id', serviceId)
        .eq('estado', 'pendiente')

    if (error) {
        console.error('Error starting service:', error)
        return { error: 'Error al iniciar el servicio' }
    }

    revalidatePath('/admin/servicios')
    revalidatePath(`/admin/servicios/${serviceId}`)
    return { success: true }
}

export async function completeService(serviceId: string) {
    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { error: 'No autorizado' }
    }

    // Get user profile to check if admin
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', user.id)
        .single()

    if (profileError || !profile || profile.rol !== 'admin') {
        return { error: 'Solo los administradores pueden completar servicios' }
    }

    const now = new Date()
    const fechaFin = now.toISOString().split('T')[0]
    const horaFin = now.toTimeString().slice(0, 5)

    // Check current service state
    const { data: currentService, error: checkError } = await supabase
        .from('services')
        .select('estado')
        .eq('id', serviceId)
        .single()

    if (checkError || !currentService) {
        console.error('Error checking service:', checkError)
        return { error: 'Error al verificar el servicio' }
    }

    // Only allow completing services that are pending or in progress
    if (currentService.estado !== 'pendiente' && currentService.estado !== 'en_proceso') {
        return { error: 'Solo se pueden completar servicios pendientes o en proceso' }
    }

    const { error } = await supabase
        .from('services')
        .update({
            estado: 'completado',
            fecha_fin: fechaFin,
            hora_fin: horaFin,
            fecha_fin_trabajo: fechaFin,
            hora_fin_trabajo: horaFin,
            completed_by_id: user.id,
        })
        .eq('id', serviceId)
        .in('estado', ['pendiente', 'en_proceso'])

    if (error) {
        console.error('Error completing service:', error)
        return { error: 'Error al completar el servicio' }
    }

    revalidatePath('/admin/servicios')
    revalidatePath(`/admin/servicios/${serviceId}`)
    return { success: true }
}

export async function deleteService(serviceId: string) {
    const supabase = await createClient()

    // Delete related records first (in correct order to avoid foreign key violations)

    // 1. Delete worker commissions
    const { error: commissionsError } = await supabase
        .from('worker_commissions')
        .delete()
        .eq('service_id', serviceId)

    if (commissionsError) {
        console.error('Error deleting commissions:', commissionsError)
        return { error: 'Error al eliminar las comisiones del servicio' }
    }

    // 2. Delete service tasks
    const { error: tasksError } = await supabase
        .from('service_tasks')
        .delete()
        .eq('service_id', serviceId)

    if (tasksError) {
        console.error('Error deleting tasks:', tasksError)
        return { error: 'Error al eliminar las tareas del servicio' }
    }

    // 3. Delete service parts
    const { error: partsError } = await supabase
        .from('service_parts')
        .delete()
        .eq('service_id', serviceId)

    if (partsError) {
        console.error('Error deleting parts:', partsError)
        return { error: 'Error al eliminar los repuestos del servicio' }
    }

    // 4. Delete service expenses
    const { error: expensesError } = await supabase
        .from('service_expenses')
        .delete()
        .eq('service_id', serviceId)

    if (expensesError) {
        console.error('Error deleting expenses:', expensesError)
        return { error: 'Error al eliminar los gastos del servicio' }
    }

    // 5. Finally, delete the service itself
    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

    if (error) {
        console.error('Error deleting service:', error)
        return { error: 'Error al eliminar el servicio' }
    }

    revalidatePath('/admin/servicios')
    redirect('/admin/servicios')
}
