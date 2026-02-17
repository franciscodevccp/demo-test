'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCustomer(data: {
    nombre: string
    rut?: string | null
    telefono?: string | null
    email?: string | null
    direccion?: string | null
    vehicle?: {
        patente: string
        marca: string
        modelo: string
        año?: number | null
        color?: string | null
        kilometraje?: number | null
    } | null
}) {
    const supabase = await createClient()

    // Validate required fields
    if (!data.nombre || data.nombre.trim() === '') {
        return { error: 'El nombre es requerido' }
    }

    // Check if customer already exists by RUT or email
    let existingCustomer = null
    
    if (data.rut && data.rut.trim()) {
        const { data: customerByRut } = await supabase
            .from('customers')
            .select('id, nombre, rut, email')
            .eq('rut', data.rut.trim())
            .single()
        
        if (customerByRut) {
            existingCustomer = customerByRut
        }
    }
    
    // If not found by RUT, check by email
    if (!existingCustomer && data.email && data.email.trim()) {
        const { data: customerByEmail } = await supabase
            .from('customers')
            .select('id, nombre, rut, email')
            .eq('email', data.email.trim().toLowerCase())
            .single()
        
        if (customerByEmail) {
            existingCustomer = customerByEmail
        }
    }

    // If customer exists and vehicle data is provided, check if vehicle is different
    if (existingCustomer && data.vehicle && data.vehicle.patente) {
        // Check if this vehicle (patente) already belongs to this customer
        const { data: existingVehicle } = await supabase
            .from('vehicles')
            .select('id, patente')
            .eq('customer_id', existingCustomer.id)
            .eq('patente', data.vehicle.patente.trim().toUpperCase())
            .single()

        // If vehicle already exists for this customer, return error
        if (existingVehicle) {
            return {
                error: `El vehículo con patente ${data.vehicle.patente.trim().toUpperCase()} ya está vinculado al cliente ${existingCustomer.nombre}`,
            }
        }

        // If vehicle doesn't exist for this customer, return special code to ask for confirmation
        return {
            needsConfirmation: true,
            existingCustomer: {
                id: existingCustomer.id,
                nombre: existingCustomer.nombre,
                rut: existingCustomer.rut,
                email: existingCustomer.email,
            },
        }
    }

    // If customer exists but no vehicle data, proceed with normal creation
    // This will create a duplicate customer (which might be intentional)

    // Insert customer
    const { data: customer, error: customerError } = await supabase
        .from('customers')
        .insert({
            nombre: data.nombre.trim(),
            rut: data.rut?.trim() || null,
            telefono: data.telefono?.trim() || null,
            email: data.email?.trim() || null,
            direccion: data.direccion?.trim() || null,
        })
        .select('id')
        .single()

    if (customerError) {
        console.error('Error creating customer:', customerError)
        return { error: customerError.message }
    }

    // If vehicle data is provided, create vehicle
    if (data.vehicle && data.vehicle.patente && data.vehicle.marca && data.vehicle.modelo) {
        const { error: vehicleError } = await supabase
            .from('vehicles')
            .insert({
                customer_id: customer.id,
                patente: data.vehicle.patente.trim().toUpperCase(),
                marca: data.vehicle.marca.trim(),
                modelo: data.vehicle.modelo.trim(),
                año: data.vehicle.año || null,
                color: data.vehicle.color?.trim() || null,
                kilometraje: data.vehicle.kilometraje || null,
            })

        if (vehicleError) {
            console.error('Error creating vehicle:', vehicleError)
            // Note: Customer was created successfully, but vehicle failed
            // We could rollback here, but for now we'll continue
            return { error: `Cliente creado, pero error al crear vehículo: ${vehicleError.message}` }
        }
    }

    // Revalidate the customers page
    revalidatePath('/admin/clientes')

    // Redirect to customers page
    redirect('/admin/clientes')
}

export async function deleteCustomer(customerId: string) {
    const supabase = await createClient()

    // 1. Check if customer has services
    const { data: services, error: servicesError } = await supabase
        .from('services')
        .select('id, numero_servicio')
        .eq('customer_id', customerId)
        .limit(1)

    if (servicesError) {
        console.error('Error checking services:', servicesError)
        return { error: 'Error al verificar servicios del cliente' }
    }

    if (services && services.length > 0) {
        return { 
            error: `No se puede eliminar el cliente porque tiene ${services.length} servicio(s) asociado(s). Elimine primero los servicios.` 
        }
    }

    // 2. Check if customer's vehicles exist
    const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('id')
        .eq('customer_id', customerId)

    if (vehiclesError) {
        console.error('Error checking vehicles:', vehiclesError)
        return { error: 'Error al verificar vehículos del cliente' }
    }

    if (vehicles && vehicles.length > 0) {
        // 3. Delete vehicles (they don't have services)
        const { error: deleteVehiclesError } = await supabase
            .from('vehicles')
            .delete()
            .eq('customer_id', customerId)

        if (deleteVehiclesError) {
            console.error('Error deleting vehicles:', deleteVehiclesError)
            return { error: 'Error al eliminar los vehículos del cliente' }
        }
    }

    // 4. Finally, delete the customer
    const { error: deleteCustomerError } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId)

    if (deleteCustomerError) {
        console.error('Error deleting customer:', deleteCustomerError)
        return { error: 'Error al eliminar el cliente' }
    }

    revalidatePath('/admin/clientes')
    redirect('/admin/clientes')
}

export async function linkVehicleToExistingCustomer(data: {
    customerId: string
    vehicle: {
        patente: string
        marca: string
        modelo: string
        año?: number | null
        color?: string | null
        kilometraje?: number | null
    }
}) {
    const supabase = await createClient()

    // Check if vehicle already exists for this customer
    const { data: existingVehicle } = await supabase
        .from('vehicles')
        .select('id')
        .eq('customer_id', data.customerId)
        .eq('patente', data.vehicle.patente.trim().toUpperCase())
        .single()

    if (existingVehicle) {
        return { error: 'Este vehículo ya está vinculado a este cliente' }
    }

    // Create vehicle linked to existing customer
    const { error: vehicleError } = await supabase
        .from('vehicles')
        .insert({
            customer_id: data.customerId,
            patente: data.vehicle.patente.trim().toUpperCase(),
            marca: data.vehicle.marca.trim(),
            modelo: data.vehicle.modelo.trim(),
            año: data.vehicle.año || null,
            color: data.vehicle.color?.trim() || null,
            kilometraje: data.vehicle.kilometraje || null,
        })

    if (vehicleError) {
        console.error('Error linking vehicle:', vehicleError)
        return { error: vehicleError.message }
    }

    // Revalidate the customers page
    revalidatePath('/admin/clientes')

    // Redirect to customers page
    redirect('/admin/clientes')
}
