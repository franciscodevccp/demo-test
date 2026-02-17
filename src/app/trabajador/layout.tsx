import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { WorkerSidebar } from '@/components/trabajador/worker-sidebar'
import { cookies } from 'next/headers'

export default async function TrabajadorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getUser()

    if (!user) {
        redirect('/')
    }

    // Admin should go to admin dashboard
    if (user.rol === 'admin') {
        redirect('/admin')
    }

    // Get sidebar state from cookie
    const cookieStore = await cookies()
    const sidebarState = cookieStore.get('sidebar_state')
    const defaultOpen = sidebarState?.value !== 'false'

    return (
        <SidebarProvider defaultOpen={defaultOpen}>
            <WorkerSidebar user={user} />
            <SidebarInset className="bg-black">
                <main className="p-4 pb-20 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
