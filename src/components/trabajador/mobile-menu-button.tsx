'use client'

import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export function MobileMenuButton() {
    const { toggleSidebar } = useSidebar()

    return (
        <Button
            onClick={toggleSidebar}
            className="md:hidden bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white p-3 rounded-lg shadow-lg"
            size="lg"
        >
            <Menu className="h-6 w-6" />
        </Button>
    )
}

