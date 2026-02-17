import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/admin/app-sidebar'
import { cookies } from 'next/headers'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    // Role check - redirect non-admins
    if (!user || user.rol !== 'admin') {
        redirect(user ? '/trabajador' : '/')
    }

    // Get sidebar state from cookie
    const cookieStore = await cookies()
    const sidebarState = cookieStore.get('sidebar_state')
    const defaultOpen = sidebarState?.value !== 'false'

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <AppSidebar user={user} />
            <SidebarInset className="bg-black">
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}
