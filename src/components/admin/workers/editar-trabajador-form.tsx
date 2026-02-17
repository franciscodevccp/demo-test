'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserCog, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { updateWorker } from '@/actions/workers'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { UserRole, Profile } from '@/types/database'

interface EditarTrabajadorFormProps {
    worker: Profile
}

const roles: { value: UserRole; label: string }[] = [
    { value: 'mecanico', label: 'Mecánico' },
    { value: 'pintor', label: 'Pintor' },
    { value: 'desabolladura', label: 'Desabolladura' },
    { value: 'preparacion', label: 'Preparación' },
    { value: 'armado', label: 'Armado' },
    { value: 'lavado', label: 'Lavado' },
    { value: 'pulido', label: 'Pulido' },
    { value: 'sistema_calidad', label: 'Sistema de Calidad' },
]

export function EditarTrabajadorForm({ worker }: EditarTrabajadorFormProps) {
    const [isPending, startTransition] = useTransition()

    // Form fields - Initialize with worker data
    const [nombre, setNombre] = useState(worker.nombre)
    const [rol, setRol] = useState<UserRole>(worker.rol)
    const [telefono, setTelefono] = useState(worker.telefono?.replace('+569', '') || '')
    const [activo, setActivo] = useState(worker.activo)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!nombre.trim()) {
            toast.error('El nombre es requerido')
            return
        }

        startTransition(async () => {
            const result = await updateWorker(worker.id, {
                nombre: nombre.trim(),
                rol,
                telefono: telefono.trim() ? `+569${telefono.trim()}` : null,
                activo,
            })

            if (result?.error) {
                toast.error('Error al actualizar trabajador', { description: result.error })
            }
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                        <UserCog className="h-5 w-5 text-cyan-400" />
                        Información del Trabajador
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Datos básicos del trabajador
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nombre" className="text-zinc-400">
                            Nombre <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="nombre"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Nombre completo del trabajador"
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rol" className="text-zinc-400">
                            Rol <span className="text-red-500">*</span>
                        </Label>
                        <Select value={rol} onValueChange={(value) => setRol(value as UserRole)}>
                            <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-white">
                                <SelectValue placeholder="Selecciona un rol" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-zinc-700">
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.value}
                                        value={role.value}
                                        className="text-white focus:bg-zinc-800"
                                    >
                                        {role.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="telefono" className="text-zinc-400">
                            Teléfono
                        </Label>
                        <div className="flex items-center">
                            <span className="inline-flex items-center h-9 px-3 rounded-l-md border border-r-0 border-zinc-700 bg-zinc-800 text-zinc-400 text-sm">
                                +569
                            </span>
                            <Input
                                id="telefono"
                                type="tel"
                                value={telefono}
                                onChange={(e) => {
                                    // Solo permitir números
                                    const value = e.target.value.replace(/\D/g, '')
                                    // Limitar a 8 dígitos (formato chileno)
                                    const limited = value.slice(0, 8)
                                    setTelefono(limited)
                                }}
                                placeholder="12345678"
                                maxLength={8}
                                className="rounded-l-none bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            id="activo"
                            type="checkbox"
                            checked={activo}
                            onChange={(e) => setActivo(e.target.checked)}
                            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-cyan-600 focus:ring-cyan-600 focus:ring-offset-zinc-900"
                        />
                        <Label htmlFor="activo" className="text-zinc-400 cursor-pointer">
                            Trabajador activo
                        </Label>
                    </div>
                </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3 justify-end">
                <Link href="/admin/trabajadores">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        Cancelar
                    </Button>
                </Link>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Guardar Cambios
                        </>
                    )}
                </Button>
            </div>
        </form>
    )
}

