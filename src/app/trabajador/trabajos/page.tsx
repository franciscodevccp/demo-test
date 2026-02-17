import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { getWorkerJobs } from '@/services/worker-services'
import { MobileMenuButton } from '@/components/trabajador/mobile-menu-button'
import { WorkerJobsList } from '@/components/trabajador/worker-jobs-list'
import { ClipboardList } from 'lucide-react'

export default async function MisTrabajosPage() {
    const user = await getUser()

    if (!user) {
        redirect('/')
    }

    // Get worker's jobs
    const jobs = await getWorkerJobs(user.id, user.rol)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MobileMenuButton />
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <ClipboardList className="h-7 w-7 text-red-500" />
                            Mis Trabajos
                        </h1>
                        <p className="mt-1 text-zinc-400">
                            Trabajos que has tomado y completado
                        </p>
                    </div>
                </div>
            </div>

            {/* Jobs List */}
            <WorkerJobsList jobs={jobs} workerId={user.id} workerRole={user.rol} />
        </div>
    )
}

