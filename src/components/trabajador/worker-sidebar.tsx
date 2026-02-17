'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Wrench,
    ClipboardList,
    DollarSign,
    StickyNote,
    FileCheck,
    LogOut,
    Package,
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
    SidebarSeparator,
} from '@/components/ui/sidebar'
import { logout } from '@/actions/auth'
import type { Profile } from '@/types/database'

const getRoleLabel = (rol: string) => {
    const roles: Record<string, string> = {
        mecanico: 'Mecánico',
        pintor: 'Pintor',
        desabolladura: 'Desabolladura',
        preparacion: 'Preparación',
        armado: 'Armado',
        lavado: 'Lavado',
        pulido: 'Pulido',
        calidad: 'Control de Calidad',
        sistema_calidad: 'Sistema de Calidad',
    }
    return roles[rol] || rol
}

const getMenuItems = (rol: string) => {
    // Menú especial para sistema_calidad: solo Servicios Disponibles, Mis Trabajos y Notas
    if (rol === 'sistema_calidad') {
        return [
            {
                title: 'Trabajos',
                items: [
                    { title: 'Servicios Disponibles', href: '/trabajador/servicios', icon: Wrench },
                    { title: 'Mis Trabajos', href: '/trabajador/trabajos', icon: ClipboardList },
                ],
            },
            {
                title: 'Otros',
                items: [
                    { title: 'Mis Notas', href: '/trabajador/notas', icon: StickyNote },
                ],
            },
        ]
    }

    // Menú estándar para otros roles
    const baseItems = [
        {
            title: 'Principal',
            items: [
                { title: 'Mi Panel', href: '/trabajador', icon: LayoutDashboard },
            ],
        },
        {
            title: 'Trabajos',
            items: [
                { title: 'Servicios Disponibles', href: '/trabajador/servicios', icon: Wrench },
                { title: 'Mis Trabajos', href: '/trabajador/trabajos', icon: ClipboardList },
            ],
        },
        {
            title: 'Finanzas',
            items: [] as Array<{ title: string; href: string; icon: any }>,
        },
        {
            title: 'Otros',
            items: [
                { title: 'Mis Notas', href: '/trabajador/notas', icon: StickyNote },
            ],
        },
    ]


    // Agregar opciones de finanzas según el rol
    if (rol === 'mecanico' || rol === 'desabolladura') {
        // Mecánicos y desabolladores tienen comisiones
        baseItems[2].items.push({ title: 'Mis Comisiones', href: '/trabajador/comisiones', icon: DollarSign })
    } else if (rol !== 'calidad' && rol !== 'sistema_calidad') {
        // Otros roles tienen paños (excepto calidad y sistema_calidad)
        baseItems[2].items.push({ title: 'Mis Paños', href: '/trabajador/panos', icon: Package })
    }

    // Si el rol es calidad, agregar opción de control de calidad
    if (rol === 'calidad') {
        baseItems[2].items.push({ title: 'Control de Calidad', href: '/trabajador/calidad', icon: FileCheck })
    }

    // Filtrar grupos vacíos
    return baseItems.filter(group => group.items.length > 0)
}

interface WorkerSidebarProps {
    user: Profile | null
}

export function WorkerSidebar({ user }: WorkerSidebarProps) {
    const pathname = usePathname()

    if (!user) {
        return null
    }

    const menuItems = getMenuItems(user.rol)

    return (
        <Sidebar collapsible="offcanvas" className="border-r border-zinc-800 bg-zinc-950">
            <SidebarHeader className="p-4 border-b border-zinc-800">
                <Link href="/trabajador" className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0">
                        <Image
                            src="/logo.webp"
                            alt="Innovautos"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-white font-bold text-lg">innovautos</span>
                        <span className="text-xs text-zinc-400 truncate">{getRoleLabel(user.rol)}</span>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent>
                {menuItems.map((group) => (
                    <SidebarGroup key={group.title}>
                        <SidebarGroupLabel className="text-zinc-500">{group.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) => (
                                    <SidebarMenuItem key={item.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={pathname === item.href}
                                            className="text-zinc-300 hover:bg-zinc-800 hover:text-white data-[active=true]:bg-red-600 data-[active=true]:text-white"
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
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
                            {user?.nombre?.charAt(0)?.toUpperCase() || 'T'}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-white truncate">
                                {user?.nombre || 'Trabajador'}
                            </span>
                            <span className="text-xs text-zinc-500">
                                {getRoleLabel(user.rol)}
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

