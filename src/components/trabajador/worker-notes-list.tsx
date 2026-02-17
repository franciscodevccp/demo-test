'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Calendar, User, Car } from 'lucide-react'
import type { NoteWithDetails } from '@/services/notes'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState, useEffect } from 'react'
import { CreateNoteDialog } from './create-note-dialog'
import { markNoteAsViewedAction } from '@/actions/notes'

interface WorkerNotesListProps {
    notes: NoteWithDetails[]
    workerId: string
    isAdmin?: boolean
}

export function WorkerNotesList({ notes, workerId, isAdmin = false }: WorkerNotesListProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [viewedNotes, setViewedNotes] = useState<Set<string>>(new Set())

    // Cargar notas vistas desde localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && isAdmin) {
            const viewedStr = localStorage.getItem('admin-viewed-notes')
            if (viewedStr) {
                setViewedNotes(new Set(JSON.parse(viewedStr)))
            }
        }
    }, [isAdmin])

    // Manejar click en una nota (solo para admin)
    async function handleNoteClick(noteId: string) {
        if (!isAdmin) return

        // Marcar como vista en localStorage
        const viewedStr = localStorage.getItem('admin-viewed-notes')
        const viewed: string[] = viewedStr ? JSON.parse(viewedStr) : []
        
        if (!viewed.includes(noteId)) {
            viewed.push(noteId)
            localStorage.setItem('admin-viewed-notes', JSON.stringify(viewed))
            setViewedNotes(new Set(viewed))
            
            // Marcar en el servidor (para futuras mejoras)
            await markNoteAsViewedAction(noteId)
            
            // Disparar evento para actualizar el badge en el sidebar
            window.dispatchEvent(new Event('note-viewed'))
        }
    }

    if (notes.length === 0) {
        return (
            <div className="space-y-4">
                {!isAdmin && (
                    <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Nota
                    </Button>
                )}
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <FileText className="h-12 w-12 text-zinc-600 mb-4" />
                        <p className="text-zinc-400 text-center">
                            {isAdmin 
                                ? 'No hay notas registradas por trabajadores.'
                                : 'No tienes notas registradas. Crea una nueva nota para comenzar.'
                            }
                        </p>
                    </CardContent>
                </Card>
                {!isAdmin && (
                    <CreateNoteDialog
                        open={createDialogOpen}
                        onClose={() => setCreateDialogOpen(false)}
                        workerId={workerId}
                    />
                )}
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {!isAdmin && (
                <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Nota
                </Button>
            )}

            <div className="grid gap-4">
                {notes.map((note) => {
                    const isViewed = viewedNotes.has(note.id)
                    return (
                    <Card 
                        key={note.id} 
                        className={`border-zinc-800 bg-zinc-900/50 ${isAdmin ? 'cursor-pointer hover:bg-zinc-900/70 transition-colors' : ''} ${isViewed && isAdmin ? 'opacity-60' : ''}`}
                        onClick={() => isAdmin && handleNoteClick(note.id)}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-lg text-white">{note.titulo}</CardTitle>
                                    <CardDescription className="mt-2 flex items-center gap-4 flex-wrap">
                                        <span className="flex items-center gap-1.5 text-zinc-400">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {format(new Date(note.created_at), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                                        </span>
                                        {note.vehicle && (
                                            <span className="flex items-center gap-1.5 text-zinc-400">
                                                <Car className="h-3.5 w-3.5" />
                                                {note.vehicle.patente} - {note.vehicle.marca} {note.vehicle.modelo}
                                            </span>
                                        )}
                                        {isAdmin && note.worker && (
                                            <span className="flex items-center gap-1.5 text-zinc-400">
                                                <User className="h-3.5 w-3.5" />
                                                {note.worker.nombre}
                                            </span>
                                        )}
                                    </CardDescription>
                                </div>
                                {note.service && (
                                    <Badge variant="outline" className="ml-2">
                                        Servicio #{note.service.numero_servicio}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-invert max-w-none">
                                <p className="text-zinc-300 whitespace-pre-wrap">{note.contenido}</p>
                            </div>
                            {note.service && (
                                <div className="mt-4 pt-4 border-t border-zinc-800">
                                    <p className="text-sm text-zinc-500">
                                        Estado del servicio: <span className="text-zinc-400 capitalize">{note.service.estado}</span>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    )
                })}
            </div>

            {!isAdmin && (
                <CreateNoteDialog
                    open={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    workerId={workerId}
                />
            )}
        </div>
    )
}

