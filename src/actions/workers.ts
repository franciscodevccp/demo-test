'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/types/database'

export async function createWorker(data: {
    nombre: string
    email: string
    password: string
    rol: UserRole
    telefono?: string | null
    activo?: boolean
}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Validate required fields
    if (!data.nombre || data.nombre.trim() === '') {
        return { error: 'El nombre es requerido' }
    }

    if (!data.email || data.email.trim() === '') {
        return { error: 'El email es requerido' }
    }

    if (!data.password || data.password.trim() === '') {
        return { error: 'La contraseña es requerida' }
    }

    if (data.password.length < 6) {
        return { error: 'La contraseña debe tener al menos 6 caracteres' }
    }

    console.log('Mock Create Worker:', data)

    // Revalidate the workers page
    revalidatePath('/admin/trabajadores')

    // Redirect to workers page
    redirect('/admin/trabajadores')
}

export async function updateWorker(workerId: string, data: {
    nombre: string
    rol: UserRole
    telefono?: string | null
    activo: boolean
}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Validate required fields
    if (!data.nombre || data.nombre.trim() === '') {
        return { error: 'El nombre es requerido' }
    }

    console.log(`Mock Update Worker ${workerId}:`, data)

    // Revalidate the workers page
    revalidatePath('/admin/trabajadores')
    revalidatePath(`/admin/trabajadores/${workerId}`)

    // Redirect to workers page
    redirect('/admin/trabajadores')
}

export async function deleteWorker(workerId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    console.log(`Mock Delete Worker ${workerId}`)

    revalidatePath('/admin/trabajadores')
    redirect('/admin/trabajadores')
}
