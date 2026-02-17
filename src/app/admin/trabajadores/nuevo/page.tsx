'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AdminHeader } from '@/components/admin/admin-header'
import { UserCog, Loader2, ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { createWorker } from '@/actions/workers'
import { toast } from 'sonner'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { UserRole } from '@/types/database'

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

export default function NuevoTrabajadorPage() {
    const [isPending, startTransition] = useTransition()

    // Form fields
    const [nombre, setNombre] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [rol, setRol] = useState<UserRole>('mecanico')
    const [telefono, setTelefono] = useState('')
    const [activo, setActivo] = useState(true)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!nombre.trim()) {
            toast.error('El nombre es requerido')
            return
        }

        if (!email.trim()) {
            toast.error('El email es requerido')
            return
        }

        if (!password.trim()) {
            toast.error('La contraseña es requerida')
            return
        }

        if (password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres')
            return
        }

        startTransition(async () => {
            const result = await createWorker({
                nombre: nombre.trim(),
                email: email.trim(),
                password,
                rol,
                telefono: telefono.trim() || null,
                activo,
            })

            if (result?.error) {
                toast.error('Error al crear trabajador', { description: result.error })
            }
        })
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Nuevo Trabajador" />

            <div className="flex-1 p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Link href="/admin/trabajadores">
                        <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Volver
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center gap-3">
                    <UserCog className="h-7 w-7 text-cyan-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Agregar Nuevo Trabajador</h2>
                        <p className="text-zinc-400 mt-1">
                            Completa la información del trabajador
                        </p>
                    </div>
                </div>

                {/* Form */}
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

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-zinc-400">
                                        Email <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="trabajador@ejemplo.com"
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-zinc-400">
                                        Contraseña <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                        minLength={6}
                                        required
                                    />
                                </div>
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
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Crear Trabajador
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

