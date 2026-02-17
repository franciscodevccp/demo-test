import { MOCK_USERS } from '@/lib/mock-data'
import type { Profile } from '@/types/database'

export async function getWorkers(orderBy: 'recientes' | 'antiguos' = 'recientes') {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    const workers = MOCK_USERS.filter(u => u.rol !== 'admin')
        .map(u => ({
            id: u.id,
            nombre: u.nombre,
            rol: u.rol,
            email: u.email,
            telefono: (u as any).telefono || '+56900000000',
            activo: (u as any).activo !== undefined ? (u as any).activo : true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }))

    return workers as Profile[]
}

export async function getWorkerById(id: string): Promise<Profile | null> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200))

    const user = MOCK_USERS.find(u => u.id === id)

    if (!user) return null

    return {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol,
        email: user.email,
        telefono: '+56900000000',
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    } as any as Profile // Casting because Profile doesn't strictly adhere to mock user structure
}

export async function searchWorkers(searchTerm: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300))

    if (!searchTerm || searchTerm.trim().length < 2) {
        return []
    }

    const search = searchTerm.toLowerCase().trim()

    const workers = MOCK_USERS.filter(u =>
        u.rol !== 'admin' &&
        (u.nombre.toLowerCase().includes(search) || u.email.toLowerCase().includes(search))
    ).map(u => ({
        id: u.id,
        nombre: u.nombre,
        rol: u.rol,
        email: u.email,
        telefono: '+56900000000',
        activo: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }))

    return workers as Profile[]
}

