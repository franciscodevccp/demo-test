'use server'

import { revalidatePath } from 'next/cache'

export async function createQualityReport(serviceId: string, workerId: string, formData: FormData) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const reportData = {
        comentarios: formData.get('comentarios'),
        calificacion: formData.get('calificacion'),
        pass_checklist: formData.get('pass_checklist')
    }
    console.log(`Mock Create Quality Report for Service ${serviceId}:`, reportData)

    // Handle mock image upload
    const files = formData.getAll('imagenes')
    console.log(`Uploaded ${files.length} images for report`)

    revalidatePath('/trabajador/servicios')
    return { success: true }
}

export async function startQualityControl(serviceId: string, workerId: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Mock Start Quality Control for Service ${serviceId} by Worker ${workerId}`)
    revalidatePath('/trabajador/servicios')
    return { success: true }
}

export async function submitQualityEvidence(data: {
    serviceId: string
    workerId: string
    descripcion: string
    fallas: string[]
    imagenes: string[]
    videos: string[]
}) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Mock Submit Quality Evidence:`, data)
    revalidatePath('/trabajador/servicios')
    return { success: true }
}

export async function approveQualityReport(reportId: string, comments: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`Mock Approve Quality Report ${reportId}. Comments: ${comments}`)

    revalidatePath('/admin/calidad')
    return { success: true }
}


export async function rejectQualityReport(reportId: string, comments: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log(`Mock Reject Quality Report ${reportId}. Comments: ${comments}`)

    revalidatePath('/admin/calidad')
    return { success: true }
}
