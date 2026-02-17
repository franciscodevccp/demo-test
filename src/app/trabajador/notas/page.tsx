import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { getWorkerNotes, getAllNotes } from '@/services/notes'
import { MobileMenuButton } from '@/components/trabajador/mobile-menu-button'
import { WorkerNotesList } from '@/components/trabajador/worker-notes-list'
import { StickyNote } from 'lucide-react'

export default async function MisNotasPage() {
    const user = await getUser()

    if (!user) {
        redirect('/')
    }

    // Get notes based on user role
    const isAdmin = user.rol === 'admin'
    const notes = isAdmin ? await getAllNotes() : await getWorkerNotes(user.id)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <MobileMenuButton />
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <StickyNote className="h-7 w-7 text-red-500" />
                            {isAdmin ? 'Todas las Notas' : 'Mis Notas'}
                        </h1>
                        <p className="mt-1 text-zinc-400">
                            {isAdmin 
                                ? 'Registro de todas las notas creadas por trabajadores'
                                : 'Registro de tus notas y observaciones'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Notes Count Summary */}
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                <div className="text-sm text-zinc-400">Total de Notas</div>
                <div className="text-2xl font-bold text-white mt-1">
                    {notes.length}
                </div>
            </div>

            {/* Notes List */}
            <WorkerNotesList notes={notes} workerId={user.id} isAdmin={isAdmin} />
        </div>
    )
}

