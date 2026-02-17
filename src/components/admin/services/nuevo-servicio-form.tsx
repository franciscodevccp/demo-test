'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
    ArrowLeft,
    Plus,
    Search,
    Car,
    User,
    Calendar,
    Clock,
    Loader2,
    CheckCircle2,
    X,
    Wrench,
    Package,
    DollarSign,
    Percent,
    Image as ImageIcon,
    Video,
    Camera,
    AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { createService, searchVehicleByPatente } from '@/actions/services'
import { toast } from 'sonner'
import type { UserRole } from '@/types/database'
import { ImageUpload } from '@/components/ui/image-upload'
import { VideoUpload } from '@/components/ui/video-upload'
import { uploadImages, uploadVideos } from '@/lib/supabase/storage'
import { getEvidenceLimits } from '@/lib/constants/evidence-limits'
interface VehicleResult {
    id: string
    patente: string
    marca: string
    modelo: string
    año: number | null
    color: string | null
    kilometraje: number | null
    customer_id: string | null
    customer: {
        id: string
        nombre: string
        telefono: string | null
        email: string | null
    } | null
}

interface Task {
    id: string
    descripcion: string
    costo_mano_obra: number
    panos: number
}

interface Part {
    id: string
    nombre_repuesto: string
    cantidad: number
    precio_unitario: number
}

interface Expense {
    id: string
    descripcion: string
    monto: number
}

interface Commission {
    id: string
    worker_role: UserRole
    monto_base: number
    porcentaje: number
    monto_comision: number
}

export function NuevoServicioForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isSearching, setIsSearching] = useState(false)

    // Search states
    const [patenteSearch, setPatenteSearch] = useState('')
    const [searchResults, setSearchResults] = useState<VehicleResult[]>([])
    const [showResults, setShowResults] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

    // Selected vehicle
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleResult | null>(null)

    // Form states
    const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
    // Obtener la hora actual en formato HH:mm
    const getCurrentTime = () => {
        const now = new Date()
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    }
    const [horaInicio, setHoraInicio] = useState(getCurrentTime())
    const [fechaEstimada, setFechaEstimada] = useState('')
    const [descripcion, setDescripcion] = useState('')

    // Tasks states
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTask, setNewTask] = useState({ descripcion: '', costo_mano_obra: 0, panos: 0 })

    // Parts states
    const [parts, setParts] = useState<Part[]>([])
    const [newPart, setNewPart] = useState({ nombre_repuesto: '', cantidad: 1, precio_unitario: 0 })

    // Expenses states
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [newExpense, setNewExpense] = useState({ descripcion: '', monto: 0 })

    // Commissions states - solo para mecánico y desabolladura
    const [commissions, setCommissions] = useState<Commission[]>([])
    const commissionRoles: UserRole[] = ['mecanico', 'desabolladura']

    // Images and videos states - evidencia inicial
    const [evidenciaImagenes, setEvidenciaImagenes] = useState<string[]>([])
    const [evidenciaVideos, setEvidenciaVideos] = useState<string[]>([])
    const [isUploadingImages, setIsUploadingImages] = useState(false)
    
    // Admin always uses standard limits (15 images, 3 videos)
    const limits = getEvidenceLimits('admin')

    // Unsaved data warning
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
    const [pendingSubmit, setPendingSubmit] = useState(false)


    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [searchTimeout])

    // Auto search while typing with debounce
    async function handleSearchAuto(searchTerm: string) {
        if (!searchTerm.trim() || searchTerm.length < 2) {
            setSearchResults([])
            setShowResults(false)
            return
        }

        setIsSearching(true)
        try {
            const results = await searchVehicleByPatente(searchTerm)
            setSearchResults(results)
            setShowResults(true)
        } catch (error) {
            console.error('Search error:', error)
            setSearchResults([])
        } finally {
            setIsSearching(false)
        }
    }

    // Handle input change with debounce
    function handlePatenteChange(value: string) {
        const upperValue = value.toUpperCase()
        setPatenteSearch(upperValue)

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        // Set new timeout for auto search (400ms delay)
        const timeout = setTimeout(() => {
            handleSearchAuto(upperValue)
        }, 400)

        setSearchTimeout(timeout)
    }

    function handleSelectVehicle(vehicle: VehicleResult) {
        setSelectedVehicle(vehicle)
        setShowResults(false)
        setPatenteSearch('')
        setSearchResults([])
    }

    function handleClearVehicle() {
        setSelectedVehicle(null)
        setPatenteSearch('')
        setSearchResults([])
        setShowResults(false)
    }

    // Quick date buttons
    function setQuickDate(days: number) {
        const date = new Date(fechaInicio)
        date.setDate(date.getDate() + days)
        setFechaEstimada(date.toISOString().split('T')[0])
    }

    // Task handlers
    function addTask() {
        if (!newTask.descripcion.trim()) {
            toast.error('La descripción de la tarea es requerida')
            return
        }
        setTasks([...tasks, { ...newTask, id: Date.now().toString() }])
        setNewTask({ descripcion: '', costo_mano_obra: 0, panos: 0 })
    }

    function removeTask(id: string) {
        setTasks(tasks.filter(t => t.id !== id))
    }

    // Part handlers
    function addPart() {
        if (!newPart.nombre_repuesto.trim()) {
            toast.error('El nombre del repuesto es requerido')
            return
        }
        setParts([...parts, { ...newPart, id: Date.now().toString() }])
        setNewPart({ nombre_repuesto: '', cantidad: 1, precio_unitario: 0 })
    }

    function removePart(id: string) {
        setParts(parts.filter(p => p.id !== id))
    }

    // Expense handlers
    function addExpense() {
        if (!newExpense.descripcion.trim()) {
            toast.error('La descripción del costo es requerida')
            return
        }
        setExpenses([...expenses, { ...newExpense, id: Date.now().toString() }])
        setNewExpense({ descripcion: '', monto: 0 })
    }

    function removeExpense(id: string) {
        setExpenses(expenses.filter(e => e.id !== id))
    }

    // Commission handlers
    function updateCommission(role: UserRole, monto: number, porcentaje: number) {
        const monto_comision = (monto * porcentaje) / 100
        const existing = commissions.find(c => c.worker_role === role)

        if (existing) {
            setCommissions(commissions.map(c =>
                c.worker_role === role
                    ? { ...c, monto_base: monto, porcentaje, monto_comision }
                    : c
            ))
        } else {
            setCommissions([
                ...commissions,
                {
                    id: Date.now().toString(),
                    worker_role: role,
                    monto_base: monto,
                    porcentaje,
                    monto_comision
                }
            ])
        }
    }

    function removeCommission(role: UserRole) {
        setCommissions(commissions.filter(c => c.worker_role !== role))
    }

    function getCommissionForRole(role: UserRole) {
        return commissions.find(c => c.worker_role === role)
    }

    // Check if there's unsaved data in input fields
    function hasUnsavedData() {
        const hasUnsavedTask = newTask.descripcion.trim() !== '' || newTask.costo_mano_obra > 0 || newTask.panos > 0
        const hasUnsavedPart = newPart.nombre_repuesto.trim() !== '' || newPart.precio_unitario > 0
        const hasUnsavedExpense = newExpense.descripcion.trim() !== '' || newExpense.monto > 0

        return hasUnsavedTask || hasUnsavedPart || hasUnsavedExpense
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!selectedVehicle) {
            toast.error('Debe seleccionar un vehículo')
            return
        }

        if (!selectedVehicle.customer) {
            toast.error('El vehículo no tiene cliente asociado')
            return
        }

        // Check for unsaved data
        if (hasUnsavedData() && !pendingSubmit) {
            setShowUnsavedWarning(true)
            return
        }

        // Reset pending submit flag
        setPendingSubmit(false)

        // Proceed with submission
        submitService()
    }

    async function submitService() {
        // Safety check - this should never happen due to earlier validation
        if (!selectedVehicle || !selectedVehicle.customer) {
            toast.error('Error: No se ha seleccionado un vehículo válido')
            return
        }

        // Capture values after null check for TypeScript
        const vehicle = selectedVehicle
        const customer = selectedVehicle.customer

        startTransition(async () => {
            try {
                // Upload images first if any
                let uploadedImageUrls: string[] = []

                if (evidenciaImagenes.length > 0) {
                    setIsUploadingImages(true)
                    toast.loading('Subiendo imágenes...')

                    // Convert blob URLs to Files
                    const imageFiles = await Promise.all(
                        evidenciaImagenes.map(async (url) => {
                            const response = await fetch(url)
                            const blob = await response.blob()
                            const fileName = `evidencia-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
                            return new File([blob], fileName, { type: 'image/jpeg' })
                        })
                    )

                    const { urls, errors } = await uploadImages(imageFiles, 'service-images', 'evidencia-inicial')

                    if (errors.length > 0) {
                        toast.error(`Error al subir ${errors.length} imagen(es)`)
                    }

                    uploadedImageUrls = urls
                    setIsUploadingImages(false)
                    toast.dismiss()
                }

                // Upload videos if any
                let uploadedVideoUrls: string[] = []
                if (evidenciaVideos.length > 0) {
                    setIsUploadingImages(true)
                    toast.loading('Subiendo videos...')

                    // Convert blob URLs to Files
                    const videoFiles = await Promise.all(
                        evidenciaVideos.map(async (url) => {
                            const response = await fetch(url)
                            const blob = await response.blob()
                            const fileName = `evidencia-${Date.now()}-${Math.random().toString(36).substring(7)}.mp4`
                            return new File([blob], fileName, { type: 'video/mp4' })
                        })
                    )

                    const { urls, errors } = await uploadVideos(videoFiles, 'service-images', 'evidencia-inicial')

                    if (errors.length > 0) {
                        toast.error(`Error al subir ${errors.length} video(s)`)
                    }

                    uploadedVideoUrls = urls
                    setIsUploadingImages(false)
                    toast.dismiss()
                }

                const serviceData = {
                    vehicleId: vehicle.id,
                    customerId: customer.id,
                    descripcionInicial: descripcion,
                    fechaInicio,
                    horaInicio,
                    fechaEstimada: fechaEstimada || null,
                    tasks: tasks.map(({ id, ...task }) => task),
                    parts: parts.map(({ id, ...part }) => part),
                    expenses: expenses.map(({ id, ...expense }) => expense),
                    commissions: commissions.map(({ id, ...commission }) => commission),
                    evidenciaImagenes: uploadedImageUrls,
                    evidenciaVideos: uploadedVideoUrls
                }

                const result = await createService(serviceData)
                if (result?.error) {
                    toast.error('Error al crear servicio', { description: result.error })
                }
            } catch (error) {
                // Redirect throws an error, which is expected
                if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
                    return
                }
                toast.error('Error inesperado')
                console.error('Error creating service:', error)
            }
        })
    }

    function handleConfirmSubmit() {
        setPendingSubmit(true)
        setShowUnsavedWarning(false)
        // Trigger form submission
        const form = document.querySelector('form')
        if (form) {
            form.requestSubmit()
        }
    }

    // Helper to format currency
    function formatCurrency(value: number) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
        }).format(value)
    }

    // Helper to get role label
    function getRoleLabel(role: UserRole): string {
        const labels: Record<UserRole, string> = {
            admin: 'Admin',
            mecanico: 'Mecánico',
            pintor: 'Pintor',
            desabolladura: 'Desabollador',
            preparacion: 'Preparación',
            armado: 'Armado',
            lavado: 'Lavado',
            pulido: 'Pulido',
            calidad: 'Calidad',
            sistema_calidad: 'Sistema Calidad'
        }
        return labels[role] || role
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Search */}
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Car className="h-5 w-5 text-blue-400" />
                        Vehículo
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Busca el vehículo por patente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {selectedVehicle ? (
                        <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                                        <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="font-mono text-lg font-bold text-white bg-zinc-800 inline-block px-3 py-1 rounded">
                                            {selectedVehicle.patente}
                                        </p>
                                        <p className="text-zinc-300 mt-1">
                                            {selectedVehicle.marca} {selectedVehicle.modelo}
                                            {selectedVehicle.color && ` • ${selectedVehicle.color}`}
                                        </p>
                                        {selectedVehicle.customer && (
                                            <p className="text-sm text-zinc-400 flex items-center gap-1 mt-1">
                                                <User className="h-3 w-3" />
                                                {selectedVehicle.customer.nombre}
                                                {selectedVehicle.customer.telefono && ` • ${selectedVehicle.customer.telefono}`}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearVehicle}
                                    className="border-zinc-700 text-zinc-400 hover:text-white"
                                >
                                    Cambiar
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Smart Search Input */}
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? 'text-blue-400 animate-pulse' : 'text-zinc-500'}`} />
                                <Input
                                    type="text"
                                    placeholder="Escribe la patente (ej: ABCD12, ABC123...)"
                                    value={patenteSearch}
                                    onChange={(e) => handlePatenteChange(e.target.value)}
                                    onFocus={() => {
                                        if (patenteSearch.length >= 2) {
                                            setShowResults(true)
                                        }
                                    }}
                                    className="pl-9 pr-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 font-mono uppercase h-12 text-lg"
                                    autoComplete="off"
                                />
                                {patenteSearch && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPatenteSearch('')
                                            setSearchResults([])
                                            setShowResults(false)
                                        }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Helper text */}
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                {isSearching ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span>Buscando vehículos...</span>
                                    </>
                                ) : patenteSearch.length > 0 && patenteSearch.length < 2 ? (
                                    <span>Escribe al menos 2 caracteres para buscar</span>
                                ) : searchResults.length > 0 ? (
                                    <span className="text-green-400">✓ {searchResults.length} {searchResults.length === 1 ? 'vehículo encontrado' : 'vehículos encontrados'}</span>
                                ) : patenteSearch.length >= 2 && !isSearching ? (
                                    <span className="text-amber-400">No se encontraron vehículos</span>
                                ) : (
                                    <span>Los resultados aparecerán automáticamente</span>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className="max-h-[400px] overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm shadow-xl">
                                    <div className="p-2 space-y-1">
                                        {searchResults.map((vehicle, index) => (
                                            <button
                                                key={vehicle.id}
                                                type="button"
                                                onClick={() => handleSelectVehicle(vehicle)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-zinc-800 transition-all group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
                                                        <Car className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-mono font-bold text-white text-lg">
                                                                {vehicle.patente}
                                                            </span>
                                                            {index === 0 && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                                    Mejor coincidencia
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-zinc-300">
                                                            {vehicle.marca} {vehicle.modelo}
                                                            {vehicle.color && ` • ${vehicle.color}`}
                                                            {vehicle.año && ` • ${vehicle.año}`}
                                                        </p>
                                                        {vehicle.customer && (
                                                            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                                                <User className="h-3 w-3" />
                                                                {vehicle.customer.nombre}
                                                                {vehicle.customer.telefono && ` • ${vehicle.customer.telefono}`}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="text-zinc-600 group-hover:text-white transition-colors">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No results message */}
                            {showResults && searchResults.length === 0 && patenteSearch.length >= 2 && !isSearching && (
                                <div className="p-6 text-center border border-dashed border-zinc-700 rounded-lg bg-zinc-900/30">
                                    <Car className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                                    <p className="text-sm font-medium text-zinc-400 mb-1">
                                        No se encontró ningún vehículo
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Patente buscada: <span className="font-mono font-semibold text-zinc-400">{patenteSearch}</span>
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-2">
                                        Verifica la patente o registra un nuevo vehículo
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Service Details & Description in 2 columns on desktop */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Left column: Detalles del Servicio */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-400" />
                            Detalles del Servicio
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Fecha de Inicio *</Label>
                            <Input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-700 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-400">Hora de Inicio *</Label>
                            <Input
                                type="time"
                                value={horaInicio}
                                onChange={(e) => setHoraInicio(e.target.value)}
                                required
                                className="bg-zinc-900 border-zinc-700 text-white"
                                title="Se establece automáticamente con la hora actual"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-zinc-400">Fecha Estimada de Finalización</Label>
                            <Input
                                type="date"
                                value={fechaEstimada}
                                onChange={(e) => setFechaEstimada(e.target.value)}
                                min={fechaInicio}
                                className="bg-zinc-900 border-zinc-700 text-white"
                            />
                            <div className="flex gap-2 mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickDate(3)}
                                    className="flex-1 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    3 días
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickDate(7)}
                                    className="flex-1 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    7 días
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setQuickDate(14)}
                                    className="flex-1 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    14 días
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Right column: Descripción */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-purple-400" />
                            Descripción Inicial
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Motivo de ingreso y problemas reportados
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Motivo de ingreso, problemas reportados, etc."
                            rows={10}
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 resize-none"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Tasks and Parts in 2 columns on desktop */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Tasks Section */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-red-400" />
                            Tareas a Realizar
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Agrega las tareas del servicio con costo y paños
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Task list */}
                        {tasks.length > 0 && (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {tasks.map((task) => (
                                    <div key={task.id} className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{task.descripcion}</p>
                                            <p className="text-xs text-zinc-400">
                                                {formatCurrency(task.costo_mano_obra)} • {task.panos} paño(s)
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeTask(task.id)}
                                            className="text-zinc-400 hover:text-red-400 shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add new task */}
                        <div className="space-y-2">
                            <Input
                                placeholder="Descripción de la tarea"
                                value={newTask.descripcion}
                                onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })}
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                            <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
                                <CurrencyInput
                                    placeholder="Costo"
                                    value={newTask.costo_mano_obra || ''}
                                    onChange={(value) => setNewTask({ ...newTask, costo_mano_obra: Number(value) || 0 })}
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    allowDecimals={false}
                                />
                                <Input
                                    type="number"
                                    placeholder="Paños"
                                    value={newTask.panos || ''}
                                    onChange={(e) => setNewTask({ ...newTask, panos: Number(e.target.value) })}
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                />
                                <Button
                                    type="button"
                                    onClick={addTask}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Parts Section */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Package className="h-5 w-5 text-green-400" />
                            Repuestos Utilizados
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Agrega los repuestos necesarios para el servicio
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Parts list */}
                        {parts.length > 0 && (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {parts.map((part) => (
                                    <div key={part.id} className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{part.nombre_repuesto}</p>
                                            <p className="text-xs text-zinc-400">
                                                {part.cantidad}x {formatCurrency(part.precio_unitario)} = {formatCurrency(part.cantidad * part.precio_unitario)}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removePart(part.id)}
                                            className="text-zinc-400 hover:text-red-400 shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add new part */}
                        <div className="space-y-2">
                            <Input
                                placeholder="Nombre del repuesto"
                                value={newPart.nombre_repuesto}
                                onChange={(e) => setNewPart({ ...newPart, nombre_repuesto: e.target.value })}
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                            <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
                                <Input
                                    type="number"
                                    placeholder="Cantidad"
                                    min="1"
                                    value={newPart.cantidad || ''}
                                    onChange={(e) => setNewPart({ ...newPart, cantidad: Number(e.target.value) })}
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                />
                                <CurrencyInput
                                    placeholder="Precio"
                                    value={newPart.precio_unitario || ''}
                                    onChange={(value) => setNewPart({ ...newPart, precio_unitario: Number(value) || 0 })}
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    allowDecimals={false}
                                />
                                <Button
                                    type="button"
                                    onClick={addPart}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Expenses and Commissions in 2 columns on desktop */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Expenses Section */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-400" />
                            Costos del Servicio
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Costos del servicio
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Expenses list */}
                        {expenses.length > 0 && (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                {expenses.map((expense) => (
                                    <div key={expense.id} className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{expense.descripcion}</p>
                                            <p className="text-xs text-zinc-400">
                                                {formatCurrency(expense.monto)}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeExpense(expense.id)}
                                            className="text-zinc-400 hover:text-red-400 shrink-0"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add new expense */}
                        <div className="space-y-2">
                            <Input
                                placeholder="Descripción del costo"
                                value={newExpense.descripcion}
                                onChange={(e) => setNewExpense({ ...newExpense, descripcion: e.target.value })}
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                            <div className="grid grid-cols-[1fr,auto] gap-2">
                                <CurrencyInput
                                    placeholder="Monto"
                                    value={newExpense.monto || ''}
                                    onChange={(value) => setNewExpense({ ...newExpense, monto: Number(value) || 0 })}
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    allowDecimals={false}
                                />
                                <Button
                                    type="button"
                                    onClick={addExpense}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Commissions Section - Solo Mecánico y Desabolladura */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Percent className="h-5 w-5 text-purple-400" />
                            Comisiones por Rol
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Ingresa el monto y porcentaje de comisión
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {commissionRoles.map((role) => {
                            const commission = getCommissionForRole(role)
                            return (
                                <div key={role} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
                                    <h4 className="text-white font-medium mb-3">{getRoleLabel(role)}</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-zinc-500">Monto $</Label>
                                                <CurrencyInput
                                                    placeholder="0"
                                                    value={commission?.monto_base || ''}
                                                    onChange={(value) => updateCommission(
                                                        role,
                                                        Number(value) || 0,
                                                        commission?.porcentaje || 0
                                                    )}
                                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                                    allowDecimals={false}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-zinc-500">%</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    min="0"
                                                    max="100"
                                                    value={commission?.porcentaje || ''}
                                                    onChange={(e) => updateCommission(
                                                        role,
                                                        commission?.monto_base || 0,
                                                        Number(e.target.value)
                                                    )}
                                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-zinc-500">Comisión</Label>
                                            <div className="flex items-center h-10 px-3 rounded-md bg-green-500/10 border border-green-500/30">
                                                <span className="text-green-400 font-semibold text-lg">
                                                    {formatCurrency(commission?.monto_comision || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>

            {/* Evidencia Inicial - Full Width at the bottom */}
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Camera className="h-5 w-5 text-blue-400" />
                        Agregar Evidencia Inicial
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Fotografías y videos del estado del vehículo al ingresar • {limits.maxImages} imágenes, {limits.maxVideos} videos
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-white">
                            Imágenes - {evidenciaImagenes.length}/{limits.maxImages}
                        </Label>
                        <ImageUpload
                            images={evidenciaImagenes}
                            onImagesChange={setEvidenciaImagenes}
                            maxImages={limits.maxImages}
                            disabled={isPending || isUploadingImages}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-white">
                            Videos - {evidenciaVideos.length}/{limits.maxVideos}
                        </Label>
                        <VideoUpload
                            videos={evidenciaVideos}
                            onVideosChange={setEvidenciaVideos}
                            maxVideos={limits.maxVideos}
                            disabled={isPending || isUploadingImages}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Actions - Fixed at bottom on desktop */}
            <div className="sticky bottom-0 bg-black border-t border-zinc-800 py-4 mt-6 -mx-6 px-6">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center max-w-7xl mx-auto">
                    <div className="text-sm text-zinc-500 order-2 sm:order-1">
                        {selectedVehicle ? (
                            <span className="text-green-400">✓ Vehículo seleccionado</span>
                        ) : (
                            <span>Selecciona un vehículo para continuar</span>
                        )}
                    </div>
                    <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
                        <Link href="/admin/servicios" className="flex-1 sm:flex-initial">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                Cancelar
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={isPending || !selectedVehicle}
                            className="flex-1 sm:flex-initial bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear Servicio
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Unsaved Data Warning Dialog */}
            <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                                <AlertTriangle className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <AlertDialogTitle className="text-white">
                                    Tienes datos sin guardar
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                    Hay información en los campos que no has agregado a la lista
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                        <p className="text-sm text-zinc-300">Los siguientes campos tienen datos sin guardar:</p>
                        <ul className="space-y-1 text-sm text-zinc-400">
                            {(newTask.descripcion.trim() !== '' || newTask.costo_mano_obra > 0 || newTask.panos > 0) && (
                                <li className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-red-400" />
                                    <span>Tarea sin agregar</span>
                                </li>
                            )}
                            {(newPart.nombre_repuesto.trim() !== '' || newPart.precio_unitario > 0) && (
                                <li className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-green-400" />
                                    <span>Repuesto sin agregar</span>
                                </li>
                            )}
                            {(newExpense.descripcion.trim() !== '' || newExpense.monto > 0) && (
                                <li className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-amber-400" />
                                    <span>Costo sin agregar</span>
                                </li>
                            )}
                        </ul>
                        <p className="text-sm text-zinc-500 mt-4">
                            ¿Deseas continuar sin guardar estos datos?
                        </p>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmSubmit}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Continuar sin guardar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    )
}
