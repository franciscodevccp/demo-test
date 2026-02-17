'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
    LayoutDashboard,
    Wrench,
    Users,
    UserCog,
    FileCheck,
    DollarSign,
    BarChart3,
    LogOut,
    StickyNote,
    Activity,
} from 'lucide-react'

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuBadge,
    SidebarSeparator,
} from '@/components/ui/sidebar'
import { logout } from '@/actions/auth'
import { getNotesCountAction } from '@/actions/notes'
import type { Profile } from '@/types/database'

const menuItems = [
    {
        title: 'Principal',
        items: [
            { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Operaciones',
        items: [
            { title: 'Servicios', href: '/admin/servicios', icon: Wrench },
            { title: 'Control de Calidad', href: '/admin/calidad', icon: FileCheck },
        ],
    },
    {
        title: 'Registros',
        items: [
            { title: 'Clientes', href: '/admin/clientes', icon: Users },
            { title: 'Trabajadores', href: '/admin/trabajadores', icon: UserCog },
            { title: 'Actividad de Trabajadores', href: '/admin/actividad-trabajadores', icon: Activity },
            { title: 'Notas de Trabajadores', href: '/admin/notas-trabajadores', icon: StickyNote },
        ],
    },
    {
        title: 'finanzas',
        items: [
            { title: 'Pago De Sueldos', href: '/admin/pagos-de-sueldos', icon: DollarSign },
            { title: 'Estadisticas', href: '/admin/estadisticas', icon: BarChart3 },
        ],
    },
]

interface AppSidebarProps {
    user: Profile | null
}

export function AppSidebar({ user }: AppSidebarProps) {
    const pathname = usePathname()
    const [notesCount, setNotesCount] = useState<number | null>(null)

    // Cargar el conteo de notas no vistas
    async function loadNotesCount() {
        const result = await getNotesCountAction()
        
        // Obtener notas vistas del localStorage
        const viewedNotesStr = localStorage.getItem('admin-viewed-notes')
        const viewedNotes: string[] = viewedNotesStr ? JSON.parse(viewedNotesStr) : []
        
        // Calcular notas no vistas
        const unreadCount = result.total - viewedNotes.length
        setNotesCount(unreadCount > 0 ? unreadCount : 0)
    }

    useEffect(() => {
        loadNotesCount()
        
        // Actualizar el conteo cada 30 segundos
        const interval = setInterval(() => {
            loadNotesCount()
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    // Actualizar el conteo cuando cambie el pathname (al navegar)
    useEffect(() => {
        loadNotesCount()
    }, [pathname])
    
    // Escuchar eventos de notas marcadas como vistas
    useEffect(() => {
        function handleNoteViewed() {
            loadNotesCount()
        }
        
        window.addEventListener('note-viewed', handleNoteViewed)
        return () => window.removeEventListener('note-viewed', handleNoteViewed)
    }, [])

    return (
        <Sidebar className="border-r border-zinc-800">
            <SidebarHeader className="p-4">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                            src="/logo.webp"
                            alt="Innovautos"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-white font-bold text-lg">innovautos</span>
                </Link>
            </SidebarHeader>

            <SidebarSeparator className="bg-zinc-800" />

            <SidebarContent className="px-2">
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="text-zinc-500 text-xs uppercase tracking-wider">
                            {group.title}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive = pathname === item.href
                                    const isNotesItem = item.href === '/admin/notas-trabajadores'
                                    // Mostrar badge si hay notas y NO estamos en la página de notas
                                    const showBadge = isNotesItem && notesCount !== null && notesCount > 0 && !isActive
                                    
                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                tooltip={item.title}
                                                className={isActive
                                                    ? 'bg-red-600 text-white hover:bg-red-700 hover:text-white'
                                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                                                }
                                            >
                                                <Link href={item.href}>
                                                    <item.icon className="h-4 w-4" />
                                                    <span>{item.title}</span>
                                                    {showBadge && (
                                                        <SidebarMenuBadge className="bg-red-600 text-white">
                                                            {notesCount}
                                                        </SidebarMenuBadge>
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarSeparator className="bg-zinc-800" />

            <SidebarFooter className="p-4">
                <div className="flex flex-col gap-3">
                    {/* User info */}
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white font-semibold text-sm">
                            {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-white truncate">
                                {user?.nombre || 'Admin'}
                            </span>
                            <span className="text-xs text-zinc-500 capitalize">
                                {user?.rol || 'Administrador'}
                            </span>
                        </div>
                    </div>

                    {/* Logout button */}
                    <form action={logout}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </form>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
