'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { MOCK_USERS } from '@/lib/mock-data'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const user = MOCK_USERS.find(u => u.email === email && u.password === password)

    if (!user) {
        return { error: 'Credenciales inválidas' }
    }

    // Create session cookie
    const cookieStore = await cookies()
    cookieStore.set('user_session', JSON.stringify({
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre
    }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
    })

    if (user.rol === 'admin') {
        redirect('/admin')
    } else {
        redirect('/trabajador')
    }
}

export async function loginAsAdmin() {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500))

    const user = MOCK_USERS.find(u => u.rol === 'admin')

    if (!user) {
        return { error: 'Usuario administrador no encontrado' }
    }

    // Create session cookie
    const cookieStore = await cookies()
    cookieStore.set('user_session', JSON.stringify({
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre
    }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
    })

    redirect('/admin')
}


export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('user_session')
    redirect('/')
}

export async function getUser() {
    const cookieStore = await cookies()
    const session = cookieStore.get('user_session')

    if (!session?.value) return null

    try {
        return JSON.parse(session.value)
    } catch {
        return null
    }
}
