'use client'

import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'

interface AdminHeaderProps {
    title?: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
    return (
        <header className="flex h-14 items-center gap-4 border-b border-zinc-800 bg-black px-4">
            <SidebarTrigger className="text-zinc-400 hover:text-white hover:bg-zinc-800" />
            <Separator orientation="vertical" className="h-6 bg-zinc-800" />
            {title && (
                <h1 className="text-lg font-semibold text-white">{title}</h1>
            )}
        </header>
    )
}
