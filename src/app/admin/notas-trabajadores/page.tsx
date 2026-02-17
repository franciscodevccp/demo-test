import { getUser } from '@/actions/auth'
import { redirect } from 'next/navigation'
import { getAllNotes } from '@/services/notes'
import { AdminHeader } from '@/components/admin/admin-header'
import { WorkerNotesList } from '@/components/trabajador/worker-notes-list'
import { StickyNote } from 'lucide-react'

export default async function NotasTrabajadoresPage() {
    const user = await getUser()

    if (!user || user.rol !== 'admin') {
        redirect(user ? '/trabajador' : '/')
    }

    // Get all notes from all workers
    const notes = await getAllNotes()

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Notas de Trabajadores" />

            <div className="flex-1 p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <StickyNote className="h-7 w-7 text-red-500" />
                            Notas de Trabajadores
                        </h1>
                        <p className="mt-1 text-zinc-400">
                            Registro de todas las notas creadas por trabajadores
                        </p>
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
                <WorkerNotesList notes={notes} workerId={user.id} isAdmin={true} />
            </div>
        </div>
    )
}

