'use client'

import { useState, useTransition, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Search,
    User,
    CheckCircle2,
    Loader2,
    DollarSign,
    Calendar,
    Image as ImageIcon,
    X,
    FileText,
} from 'lucide-react'
import { searchWorkersForPayment, getWorkerPaymentData, createSalaryPayment } from '@/actions/salary-payments'
import { toast } from 'sonner'
    import type { Profile, UserRole, WorkerPano } from '@/types/database'
import type { WorkerCommissionWithService } from '@/services/worker-payments'
import { ImageUpload } from '@/components/ui/image-upload'
import { uploadImages } from '@/lib/supabase/storage'

function formatCurrency(amount: number | null) {
    if (!amount && amount !== 0) return '$0'
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
    }).format(amount)
}

function formatDate(dateStr: string) {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('es-CL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date)
}

function formatRole(rol: UserRole): string {
    const roles: Partial<Record<UserRole, string>> = {
        admin: 'Administrador',
        mecanico: 'Mecánico',
        pintor: 'Pintor',
        desabolladura: 'Desabolladura',
        preparacion: 'Preparación',
        armado: 'Armado',
        lavado: 'Lavado',
        pulido: 'Pulido',
        sistema_calidad: 'Sistema de Calidad',
    }
    return roles[rol] || rol
}

const COMMISSION_ROLES: UserRole[] = ['mecanico', 'desabolladura']

export function NuevoPagoForm() {
    const [isPending, startTransition] = useTransition()
    const [isSearching, setIsSearching] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(false)
    const [isUploadingImages, setIsUploadingImages] = useState(false)

    // Search states
    const [workerSearch, setWorkerSearch] = useState('')
    const [searchResults, setSearchResults] = useState<Profile[]>([])
    const [showResults, setShowResults] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

    // Selected worker
    const [selectedWorker, setSelectedWorker] = useState<Profile | null>(null)
    const [workerCommissions, setWorkerCommissions] = useState<WorkerCommissionWithService[]>([])
    const [workerPanos, setWorkerPanos] = useState<WorkerPano[]>([])

    // Form states
    const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0])
    const [descripcion, setDescripcion] = useState('')
    const [comprobanteImagenes, setComprobanteImagenes] = useState<string[]>([])

    // Payment type states
    const [tipoPago, setTipoPago] = useState<'comision' | 'panos' | null>(null)
    const [monto, setMonto] = useState('')
    const [cantidadPanos, setCantidadPanos] = useState('')
    const [precioPano, setPrecioPano] = useState('')

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
            const results = await searchWorkersForPayment(searchTerm)
            setSearchResults(results)
            setShowResults(true)
        } catch (error) {
            console.error('Search error:', error)
            setSearchResults([])
            toast.error('Error al buscar trabajadores')
        } finally {
            setIsSearching(false)
        }
    }

    // Handle input change with debounce
    function handleWorkerSearchChange(value: string) {
        setWorkerSearch(value)

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }

        // Set new timeout for auto search (400ms delay)
        const timeout = setTimeout(() => {
            handleSearchAuto(value)
        }, 400)

        setSearchTimeout(timeout)
    }

    async function handleSelectWorker(worker: Profile) {
        setSelectedWorker(worker)
        setShowResults(false)
        setWorkerSearch('')
        setSearchResults([])
        
        // Reset form
        setTipoPago(null)
        setMonto('')
        setCantidadPanos('')
        setPrecioPano('')
        setDescripcion('')
        setComprobanteImagenes([])

        // Load worker data
        setIsLoadingData(true)
        try {
            const data = await getWorkerPaymentData(worker.id)
            setWorkerCommissions(data.commissions)
            setWorkerPanos(data.panos)

            // Determine payment type based on role
            if (COMMISSION_ROLES.includes(worker.rol)) {
                setTipoPago('comision')
                // Calculate total from pending commissions
                const totalCommissions = data.commissions.reduce((sum, c) => sum + (c.monto_comision || 0), 0)
                setMonto(totalCommissions.toString())
            } else {
                setTipoPago('panos')
                // Calculate total paños
                const totalPanos = data.panos.reduce((sum, p) => sum + (p.cantidad_panos || 0), 0)
                setCantidadPanos(totalPanos.toString())
            }
        } catch (error) {
            console.error('Error loading worker data:', error)
            toast.error('Error al cargar datos del trabajador')
        } finally {
            setIsLoadingData(false)
        }
    }

    function handleClearWorker() {
        setSelectedWorker(null)
        setWorkerSearch('')
        setSearchResults([])
        setShowResults(false)
        setWorkerCommissions([])
        setWorkerPanos([])
        setTipoPago(null)
        setMonto('')
        setCantidadPanos('')
        setPrecioPano('')
        setDescripcion('')
        setComprobanteImagenes([])
    }

    // Calculate monto when cantidadPanos or precioPano changes
    useEffect(() => {
        if (tipoPago === 'panos' && cantidadPanos && precioPano) {
            const cantidad = Number(cantidadPanos) || 0
            const precio = Number(precioPano) || 0
            const total = cantidad * precio
            setMonto(total.toString())
        }
    }, [cantidadPanos, precioPano, tipoPago])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!selectedWorker) {
            toast.error('Debes seleccionar un trabajador')
            return
        }

        if (!tipoPago) {
            toast.error('Tipo de pago no determinado')
            return
        }

        if (!monto || Number(monto) <= 0) {
            toast.error('El monto debe ser mayor a 0')
            return
        }

        if (tipoPago === 'panos') {
            if (!cantidadPanos || Number(cantidadPanos) <= 0) {
                toast.error('La cantidad de paños debe ser mayor a 0')
                return
            }
            if (!precioPano || Number(precioPano) < 0) {
                toast.error('El precio por paño debe ser mayor o igual a 0')
                return
            }
        }

        if (!fechaPago) {
            toast.error('La fecha de pago es requerida')
            return
        }

        startTransition(async () => {
            try {
                // Upload images first if any
                let uploadedImageUrls: string[] = []

                if (comprobanteImagenes.length > 0) {
                    setIsUploadingImages(true)
                    toast.loading('Subiendo imágenes...')

                    // Convert blob URLs to Files
                    const imageFiles = await Promise.all(
                        comprobanteImagenes.map(async (url) => {
                            const response = await fetch(url)
                            const blob = await response.blob()
                            const fileName = `comprobante-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
                            return new File([blob], fileName, { type: 'image/jpeg' })
                        })
                    )

                    const { urls, errors } = await uploadImages(imageFiles, 'service-images', 'salary-payments')

                    if (errors.length > 0) {
                        toast.error(`Error al subir ${errors.length} imagen(es)`)
                    }

                    uploadedImageUrls = urls
                    setIsUploadingImages(false)
                    toast.dismiss()
                }

                const paymentData = {
                    workerId: selectedWorker.id,
                    tipoPago: tipoPago,
                    monto: Number(monto),
                    cantidadPanos: tipoPago === 'panos' ? Number(cantidadPanos) : null,
                    precioPano: tipoPago === 'panos' ? Number(precioPano) : null,
                    fechaPago,
                    descripcion: descripcion.trim() || null,
                    comprobanteUrls: uploadedImageUrls, // Pass URLs directly since we already uploaded them
                }

                const result = await createSalaryPayment(paymentData)
                if (result?.error) {
                    toast.error('Error al crear pago', { description: result.error })
                }
            } catch (error) {
                // Redirect throws an error, which is expected
                if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
                    return
                }
                toast.error('Error inesperado')
                console.error('Error creating payment:', error)
            }
        })
    }

    const isCommissionRole = selectedWorker && COMMISSION_ROLES.includes(selectedWorker.rol)
    const totalCommissions = workerCommissions.reduce((sum, c) => sum + (c.monto_comision || 0), 0)
    const totalPanos = workerPanos.reduce((sum, p) => sum + (p.cantidad_panos || 0), 0)

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Worker Search */}
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-400" />
                        Buscar Trabajador
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Busca por nombre o email del trabajador
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!selectedWorker ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nombre o email..."
                                    value={workerSearch}
                                    onChange={(e) => handleWorkerSearchChange(e.target.value)}
                                    className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                />
                            </div>

                            {/* Helper text */}
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                {isSearching ? (
                                    <>
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                        <span>Buscando trabajadores...</span>
                                    </>
                                ) : workerSearch.length > 0 && workerSearch.length < 2 ? (
                                    <span>Escribe al menos 2 caracteres para buscar</span>
                                ) : searchResults.length > 0 ? (
                                    <span className="text-green-400">
                                        ✓ {searchResults.length} {searchResults.length === 1 ? 'trabajador encontrado' : 'trabajadores encontrados'}
                                    </span>
                                ) : workerSearch.length >= 2 && !isSearching ? (
                                    <span className="text-amber-400">No se encontraron trabajadores</span>
                                ) : (
                                    <span>Los resultados aparecerán automáticamente</span>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {showResults && searchResults.length > 0 && (
                                <div className="max-h-[400px] overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm shadow-xl">
                                    <div className="p-2 space-y-1">
                                        {searchResults.map((worker, index) => (
                                            <button
                                                key={worker.id}
                                                type="button"
                                                onClick={() => handleSelectWorker(worker)}
                                                className="w-full text-left p-3 rounded-lg hover:bg-zinc-800 transition-all group"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors shrink-0">
                                                        <User className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-semibold text-white">
                                                                {worker.nombre}
                                                            </span>
                                                            {index === 0 && (
                                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                                                    Mejor coincidencia
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-zinc-300">
                                                            {formatRole(worker.rol)}
                                                        </p>
                                                        {worker.telefono && (
                                                            <p className="text-xs text-zinc-500 mt-1">
                                                                {worker.telefono}
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
                        </div>
                    ) : (
                        <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{selectedWorker.nombre}</p>
                                    <p className="text-sm text-zinc-400">{formatRole(selectedWorker.rol)}</p>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleClearWorker}
                                className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Cambiar
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Worker Data */}
            {selectedWorker && (
                <>
                    {isLoadingData ? (
                        <Card className="border-zinc-800 bg-zinc-900/50">
                            <CardContent className="py-12">
                                <div className="flex flex-col items-center justify-center gap-3">
                                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                                    <p className="text-sm text-zinc-400">Cargando datos del trabajador...</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Commissions or Panos List */}
                            {isCommissionRole ? (
                                <Card className="border-zinc-800 bg-zinc-900/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-white flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-purple-400" />
                                            Comisiones Pendientes
                                        </CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            Total pendiente: {formatCurrency(totalCommissions)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {workerCommissions.length > 0 ? (
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                {workerCommissions.map((commission) => (
                                                    <div
                                                        key={commission.id}
                                                        className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-white font-medium">
                                                                    Servicio #{commission.service?.numero_servicio || 'N/A'}
                                                                </p>
                                                                {commission.service?.vehicle && (
                                                                    <p className="text-xs text-zinc-400 mt-1">
                                                                        {commission.service.vehicle.patente} - {commission.service.vehicle.marca} {commission.service.vehicle.modelo}
                                                                    </p>
                                                                )}
                                                                <p className="text-xs text-zinc-500 mt-1">
                                                                    {formatDate(commission.created_at)} • {commission.porcentaje}%
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm font-semibold text-purple-400">
                                                                    {formatCurrency(commission.monto_comision)}
                                                                </p>
                                                                <p className="text-xs text-zinc-500">
                                                                    Base: {formatCurrency(commission.monto_base)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 border border-dashed border-zinc-700 rounded-lg bg-zinc-900/30">
                                                <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                                                <p className="text-sm text-zinc-400">No hay comisiones pendientes</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card className="border-zinc-800 bg-zinc-900/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-white flex items-center gap-2">
                                            <FileText className="h-5 w-5 text-green-400" />
                                            Paños Registrados
                                        </CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            Total de paños: {totalPanos}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {workerPanos.length > 0 ? (
                                            <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                                {workerPanos.map((pano) => (
                                                    <div
                                                        key={pano.id}
                                                        className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-white">
                                                                    {pano.cantidad_panos} paño{pano.cantidad_panos !== 1 ? 's' : ''}
                                                                </p>
                                                                <p className="text-xs text-zinc-400 mt-1">
                                                                    {formatDate(pano.fecha_asignacion)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 border border-dashed border-zinc-700 rounded-lg bg-zinc-900/30">
                                                <FileText className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                                                <p className="text-sm text-zinc-400">No hay paños registrados</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Payment Form */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* Left column: Payment Details */}
                                <Card className="border-zinc-800 bg-zinc-900/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-white flex items-center gap-2">
                                            <DollarSign className="h-5 w-5 text-emerald-400" />
                                            Detalles del Pago
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="fechaPago" className="text-zinc-300">
                                                Fecha de Pago *
                                            </Label>
                                            <Input
                                                id="fechaPago"
                                                type="date"
                                                value={fechaPago}
                                                onChange={(e) => setFechaPago(e.target.value)}
                                                className="bg-zinc-900 border-zinc-700 text-white"
                                                required
                                            />
                                        </div>

                                        {tipoPago === 'panos' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="cantidadPanos" className="text-zinc-300">
                                                            Cantidad de Paños *
                                                        </Label>
                                                        <Input
                                                            id="cantidadPanos"
                                                            type="number"
                                                            min="1"
                                                            value={cantidadPanos}
                                                            onChange={(e) => setCantidadPanos(e.target.value)}
                                                            className="bg-zinc-900 border-zinc-700 text-white"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="precioPano" className="text-zinc-300">
                                                            Precio por Paño *
                                                        </Label>
                                                        <CurrencyInput
                                                            id="precioPano"
                                                            value={precioPano}
                                                            onChange={setPrecioPano}
                                                            className="bg-zinc-900 border-zinc-700 text-white"
                                                            allowDecimals={false}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="monto" className="text-zinc-300">
                                                Monto Total *
                                            </Label>
                                            <CurrencyInput
                                                id="monto"
                                                value={monto}
                                                onChange={setMonto}
                                                className="bg-zinc-900 border-zinc-700 text-white"
                                                allowDecimals={false}
                                                disabled={tipoPago === 'panos' && !!cantidadPanos && !!precioPano}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="descripcion" className="text-zinc-300">
                                                Descripción (opcional)
                                            </Label>
                                            <Textarea
                                                id="descripcion"
                                                value={descripcion}
                                                onChange={(e) => setDescripcion(e.target.value)}
                                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                                rows={3}
                                                placeholder="Descripción adicional del pago..."
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Right column: Receipt Images */}
                                <Card className="border-zinc-800 bg-zinc-900/50">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-white flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5 text-blue-400" />
                                            Comprobantes de Pago
                                        </CardTitle>
                                        <CardDescription className="text-zinc-400">
                                            Sube fotos de los comprobantes • Máximo 10 fotos
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ImageUpload
                                            images={comprobanteImagenes}
                                            onImagesChange={setComprobanteImagenes}
                                            maxImages={10}
                                            disabled={isPending || isUploadingImages}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                            <Button
                                type="submit"
                                disabled={isPending || isUploadingImages || !monto || (monto ? Number(monto) <= 0 : true)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px]"
                            >
                                    {isPending || isUploadingImages ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <DollarSign className="h-4 w-4 mr-2" />
                                            Registrar Pago
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    )}
                </>
            )}
        </form>
    )
}

