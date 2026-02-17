'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AdminHeader } from '@/components/admin/admin-header'
import { Users, Loader2, ArrowLeft, Save, Car, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { createCustomer, linkVehicleToExistingCustomer } from '@/actions/customers'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function NuevoClientePage() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    // Customer fields
    const [nombre, setNombre] = useState('')
    const [rut, setRut] = useState('')
    const [telefono, setTelefono] = useState('')
    const [email, setEmail] = useState('')
    const [direccion, setDireccion] = useState('')

    // Vehicle fields
    const [patente, setPatente] = useState('')
    const [marca, setMarca] = useState('')
    const [modelo, setModelo] = useState('')
    const [año, setAño] = useState('')
    const [color, setColor] = useState('')
    const [kilometraje, setKilometraje] = useState('')

    // Dialog state for existing customer confirmation
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [existingCustomer, setExistingCustomer] = useState<{
        id: string
        nombre: string
        rut: string | null
        email: string | null
    } | null>(null)

    // Format RUT with separators (XX.XXX.XXX-X)
    const formatRUT = (value: string): string => {
        // Remove all non-numeric characters except K
        let cleaned = value.replace(/[^\dKk]/g, '').toUpperCase()
        
        if (!cleaned) return ''
        
        // If the last character is K, treat it as verification digit
        // Otherwise, if it's a number and there are at least 2 digits, treat the last as verification digit
        let verificationDigit = ''
        let numbers = cleaned
        
        if (cleaned.length > 1) {
            // Check if last character is K or if we have enough digits to separate
            const lastChar = cleaned.slice(-1)
            if (lastChar === 'K' || (cleaned.length >= 2 && /^\d+$/.test(cleaned.slice(0, -1)))) {
                verificationDigit = lastChar
                numbers = cleaned.slice(0, -1)
            }
        } else if (cleaned === 'K') {
            return 'K'
        }
        
        if (!numbers) {
            return verificationDigit || ''
        }
        
        // Add dots as thousands separators from right to left
        const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        
        // Return with verification digit separated by dash if we have one
        return verificationDigit ? `${formatted}-${verificationDigit}` : formatted
    }

    const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        // Remove all non-numeric characters except K and dash
        const cleaned = input.replace(/[^\dKk-]/g, '').toUpperCase()
        
        // Format the RUT
        const formatted = formatRUT(cleaned)
        setRut(formatted)
    }

    // Format kilometraje with thousand separators
    const formatKilometraje = (value: string): string => {
        // Remove all non-numeric characters
        const cleaned = value.replace(/\D/g, '')
        
        if (!cleaned) return ''
        
        // Add points as thousand separators
        return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    }

    const handleKilometrajeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const input = e.target.value
        // Remove all non-numeric characters
        const cleaned = input.replace(/\D/g, '')
        
        // Format with thousand separators
        const formatted = formatKilometraje(cleaned)
        setKilometraje(formatted)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!nombre.trim()) {
            toast.error('El nombre es requerido')
            return
        }

        // Validate vehicle fields if any are filled
        const hasVehicleData = patente.trim() || marca.trim() || modelo.trim()
        if (hasVehicleData) {
            if (!patente.trim()) {
                toast.error('La patente es requerida si desea agregar un vehículo')
                return
            }
            if (!marca.trim()) {
                toast.error('La marca es requerida si desea agregar un vehículo')
                return
            }
            if (!modelo.trim()) {
                toast.error('El modelo es requerido si desea agregar un vehículo')
                return
            }
        }

        startTransition(async () => {
            const result = await createCustomer({
                nombre: nombre.trim(),
                rut: rut.trim() || null,
                telefono: telefono.trim() ? `+569${telefono.trim()}` : null,
                email: email.trim() || null,
                direccion: direccion.trim() || null,
                vehicle: hasVehicleData ? {
                    patente: patente.trim(),
                    marca: marca.trim(),
                    modelo: modelo.trim(),
                    año: año ? parseInt(año) : null,
                    color: color.trim() || null,
                    kilometraje: kilometraje ? parseInt(kilometraje.replace(/\./g, '')) : null,
                } : null,
            })

            if (result?.error) {
                toast.error('Error al crear cliente', { description: result.error })
            } else if (result?.needsConfirmation && result.existingCustomer) {
                // Show confirmation dialog
                setExistingCustomer(result.existingCustomer)
                setShowConfirmDialog(true)
            }
        })
    }

    const handleConfirmLink = () => {
        if (!existingCustomer || !patente.trim() || !marca.trim() || !modelo.trim()) {
            toast.error('Error: datos incompletos')
            return
        }

        startTransition(async () => {
            const result = await linkVehicleToExistingCustomer({
                customerId: existingCustomer.id,
                vehicle: {
                    patente: patente.trim(),
                    marca: marca.trim(),
                    modelo: modelo.trim(),
                    año: año ? parseInt(año) : null,
                    color: color.trim() || null,
                    kilometraje: kilometraje ? parseInt(kilometraje.replace(/\./g, '')) : null,
                },
            })

            if (result?.error) {
                toast.error('Error al vincular vehículo', { description: result.error })
                setShowConfirmDialog(false)
            } else {
                toast.success('Vehículo vinculado exitosamente', {
                    description: `El vehículo ${patente.trim()} ha sido vinculado a ${existingCustomer.nombre}`,
                })
            }
        })
    }

    const handleCancelLink = () => {
        setShowConfirmDialog(false)
        setExistingCustomer(null)
    }

    return (
        <div className="flex flex-col min-h-screen">
            <AdminHeader title="Nuevo Cliente" />

            <div className="flex-1 p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Users className="h-7 w-7 text-green-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-white">Agregar Nuevo Cliente</h2>
                        <p className="text-zinc-400 mt-1">
                            Completa la información del cliente y su vehículo
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-green-400" />
                                Información Personal
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Datos básicos del cliente
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
                                    placeholder="Nombre completo del cliente"
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    required
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="rut" className="text-zinc-400">
                                        RUT
                                    </Label>
                                    <Input
                                        id="rut"
                                        type="text"
                                        value={rut}
                                        onChange={handleRutChange}
                                        placeholder="12.345.678-9"
                                        maxLength={12}
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
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
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-400">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="cliente@ejemplo.com"
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="direccion" className="text-zinc-400">
                                    Dirección
                                </Label>
                                <Textarea
                                    id="direccion"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    placeholder="Dirección completa"
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[100px]"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Vehicle Information */}
                    <Card className="border-zinc-800 bg-zinc-900/50">
                        <CardHeader>
                            <CardTitle className="text-lg text-white flex items-center gap-2">
                                <Car className="h-5 w-5 text-blue-400" />
                                Información del Vehículo
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Datos del vehículo asociado al cliente 
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="patente" className="text-zinc-400">
                                        Patente
                                    </Label>
                                    <Input
                                        id="patente"
                                        type="text"
                                        value={patente}
                                        onChange={(e) => setPatente(e.target.value.toUpperCase())}
                                        placeholder="ABCD12"
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 font-mono uppercase"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="marca" className="text-zinc-400">
                                        Marca
                                    </Label>
                                    <Input
                                        id="marca"
                                        type="text"
                                        value={marca}
                                        onChange={(e) => setMarca(e.target.value)}
                                        placeholder="Toyota"
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="modelo" className="text-zinc-400">
                                        Modelo
                                    </Label>
                                    <Input
                                        id="modelo"
                                        type="text"
                                        value={modelo}
                                        onChange={(e) => setModelo(e.target.value)}
                                        placeholder="Corolla"
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="año" className="text-zinc-400">
                                        Año
                                    </Label>
                                    <Input
                                        id="año"
                                        type="number"
                                        value={año}
                                        onChange={(e) => setAño(e.target.value)}
                                        placeholder="2020"
                                        min="1900"
                                        max="2100"
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="color" className="text-zinc-400">
                                        Color
                                    </Label>
                                    <Input
                                        id="color"
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="Rojo"
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="kilometraje" className="text-zinc-400">
                                        Kilometraje
                                    </Label>
                                    <Input
                                        id="kilometraje"
                                        type="text"
                                        value={kilometraje}
                                        onChange={handleKilometrajeChange}
                                        placeholder="50000"
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action buttons */}
                    <div className="flex justify-end gap-3">
                        <Link href="/admin/clientes">
                            <Button
                                type="button"
                                variant="outline"
                                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
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
                                    Crear Cliente
                                </>
                            )}
                        </Button>
                    </div>
                </form>

                {/* Confirmation Dialog for Existing Customer */}
                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                        <AlertDialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
                                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                                </div>
                                <div>
                                    <AlertDialogTitle className="text-white">
                                        Cliente Existente Detectado
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-zinc-400">
                                        Este cliente ya existe en el sistema
                                    </AlertDialogDescription>
                                </div>
                            </div>
                        </AlertDialogHeader>
                        <div className="py-4 space-y-3">
                            <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                                <p className="text-sm text-zinc-400 mb-2">Cliente existente:</p>
                                <p className="text-white font-medium">{existingCustomer?.nombre}</p>
                                {existingCustomer?.rut && (
                                    <p className="text-sm text-zinc-500">RUT: {existingCustomer.rut}</p>
                                )}
                                {existingCustomer?.email && (
                                    <p className="text-sm text-zinc-500">Email: {existingCustomer.email}</p>
                                )}
                            </div>
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <p className="text-sm text-zinc-400 mb-2">Nuevo vehículo a vincular:</p>
                                <p className="text-white font-medium font-mono">{patente.toUpperCase()}</p>
                                <p className="text-sm text-zinc-500">{marca} {modelo}</p>
                            </div>
                            <p className="text-sm text-zinc-400">
                                ¿Desea vincular este vehículo al cliente existente en lugar de crear un nuevo cliente?
                            </p>
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel
                                onClick={handleCancelLink}
                                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleConfirmLink}
                                disabled={isPending}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Vinculando...
                                    </>
                                ) : (
                                    'Sí, Vincular Vehículo'
                                )}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}
