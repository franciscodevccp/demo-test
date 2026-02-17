'use server'

import { revalidatePath } from 'next/cache'
import { MOCK_NOTES, MOCK_SERVICES, MOCK_VEHICLES } from '@/lib/mock-data'
import { getServicesByVehiclePatente } from '@/services/notes'

export async function createNote(formData: FormData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const noteData = {
        titulo: formData.get('titulo'),
        contenido: formData.get('contenido'),
        service_id: formData.get('service_id'),
        worker_id: formData.get('worker_id')
    }

    console.log('Mock Create Note:', noteData)

    revalidatePath('/trabajador/notas')
    if (noteData.service_id) {
        revalidatePath(`/trabajador/servicios/${noteData.service_id}`)
    }
    return { success: true }
}

export async function updateNote(noteId: string, formData: FormData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const noteData = {
        titulo: formData.get('titulo'),
        contenido: formData.get('contenido'),
    }

    console.log(`Mock Update Note ${noteId}:`, noteData)

    revalidatePath('/trabajador/notas')
    return { success: true }
}

export async function deleteNote(noteId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`Mock Delete Note ${noteId}`)

    revalidatePath('/trabajador/notas')
    return { success: true }
}

export async function createAdminNote(serviceId: string, content: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log(`Mock Create Admin Note for Service ${serviceId}:`, content)

    revalidatePath(`/admin/servicios/${serviceId}`)
    return { success: true }
}

export async function getNotesCountAction() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    return {
        total: MOCK_NOTES.length
    }
}

export async function searchPatentesAction(query: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!query) return { patentes: [] }

    const results = MOCK_VEHICLES.filter(v =>
        v.patente.toLowerCase().includes(query.toLowerCase())
    ).map(v => ({
        patente: v.patente,
        marca: v.marca,
        modelo: v.modelo,
        año: v.ano
    }))

    return { patentes: results }
}

export async function getServicesByPatenteAction(patente: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    try {
        const services = await getServicesByVehiclePatente(patente)
        return { services }
    } catch (error) {
        console.error('Error getting services:', error)
        return { error: 'Error al buscar servicios' }
    }
}

export async function markNoteAsViewedAction(noteId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // In a real app we would update the database
    console.log(`Note ${noteId} marked as viewed`)

    return { success: true }
}
