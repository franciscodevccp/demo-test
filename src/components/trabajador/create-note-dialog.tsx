'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { createNote, getServicesByPatenteAction, searchPatentesAction } from '@/actions/notes'
import { toast } from 'sonner'
import { Loader2, Search, Car } from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface CreateNoteDialogProps {
    open: boolean
    onClose: () => void
    workerId: string
}

export function CreateNoteDialog({ open, onClose, workerId }: CreateNoteDialogProps) {
    const [loading, setLoading] = useState(false)
    const [searching, setSearching] = useState(false)
    const [titulo, setTitulo] = useState('')
    const [contenido, setContenido] = useState('')
    const [patente, setPatente] = useState('')
    const [patenteSuggestions, setPatenteSuggestions] = useState<Array<{
        patente: string
        marca: string
        modelo: string
        año: number | null
    }>>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [services, setServices] = useState<Array<{
        id: string
        numero_servicio: number
        descripcion_inicial: string | null
        estado: string
        fecha_inicio: string
        vehicle: {
            id: string
            patente: string
            marca: string
            modelo: string
            año: number | null
            color: string | null
        }
    }>>([])
    const [selectedServiceId, setSelectedServiceId] = useState<string>('')

    useEffect(() => {
        if (!open) {
            // Reset form when dialog closes
            setTitulo('')
            setContenido('')
            setPatente('')
            setServices([])
            setSelectedServiceId('')
            setPatenteSuggestions([])
            setShowSuggestions(false)
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [open, searchTimeout])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout)
            }
        }
    }, [searchTimeout])

    // Close suggestions when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        if (showSuggestions) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }
    }, [showSuggestions])

    // Auto search for patentes while typing
    async function handleSearchPatentes(searchTerm: string) {
        if (!searchTerm.trim() || searchTerm.length < 1) {
            setPatenteSuggestions([])
            setShowSuggestions(false)
            return
        }

        try {
            const result = await searchPatentesAction(searchTerm.trim())
            if (result.error) {
                console.error('Error searching patentes:', result.error)
                setPatenteSuggestions([])
                setShowSuggestions(false)
            } else {
                const patentes = result.patentes || []
                setPatenteSuggestions(patentes)
                setShowSuggestions(patentes.length > 0)
            }
        } catch (error) {
            console.error('Error searching patentes:', error)
            setPatenteSuggestions([])
            setShowSuggestions(false)
        }
    }

    // Handle patente input change with debounce
    function handlePatenteChange(value: string) {
        const upperValue = value.toUpperCase()
        setPatente(upperValue)
        
        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout)
        }
        
        // Set new timeout for auto search (300ms delay)
        const timeout = setTimeout(() => {
            handleSearchPatentes(upperValue)
        }, 300)
        setSearchTimeout(timeout)
    }

    // Handle selecting a patente from suggestions
    function handleSelectPatente(selectedPatente: string) {
        setPatente(selectedPatente)
        setShowSuggestions(false)
        setPatenteSuggestions([])
        // Automatically search for services when patente is selected
        handleSearch()
    }

    const handleSearch = async () => {
        if (!patente.trim()) {
            toast.error('Ingresa una matrícula para buscar')
            return
        }

        setSearching(true)
        try {
            const result = await getServicesByPatenteAction(patente.trim())
            if (result.error) {
                toast.error(result.error)
            } else {
                setServices(result.services || [])
                if (result.services && result.services.length > 0) {
                    toast.success(`${result.services.length} servicio(s) encontrado(s)`)
                } else {
                    toast.info('No se encontraron servicios para esta matrícula')
                }
            }
        } catch (error) {
            console.error('Error searching services:', error)
            toast.error('Error al buscar servicios')
        } finally {
            setSearching(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!titulo.trim()) {
            toast.error('El título es requerido')
            return
        }

        if (!contenido.trim()) {
            toast.error('La descripción es requerida')
            return
        }

        if (!selectedServiceId) {
            toast.error('Debes seleccionar un servicio')
            return
        }

        setLoading(true)
        try {
            const result = await createNote({
                serviceId: selectedServiceId,
                workerId,
                titulo: titulo.trim(),
                contenido: contenido.trim(),
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Nota creada exitosamente')
                onClose()
            }
        } catch (error) {
            console.error('Error creating note:', error)
            toast.error('Error al crear la nota')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-white">Crear Nueva Nota</DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Registra información importante sobre un servicio relacionado con un vehículo
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Search Vehicle by Patente */}
                    <div className="space-y-2 relative">
                        <Label htmlFor="patente" className="text-zinc-300">
                            Matrícula del Vehículo
                        </Label>
                        <div className="flex gap-2 relative">
                            <div className="flex-1 relative">
                                <Input
                                    ref={inputRef}
                                    id="patente"
                                    value={patente}
                                    onChange={(e) => handlePatenteChange(e.target.value)}
                                    onFocus={() => {
                                        if (patenteSuggestions.length > 0) {
                                            setShowSuggestions(true)
                                        }
                                    }}
                                    placeholder="Ej: ABC123"
                                    className="bg-zinc-800 border-zinc-700 text-white"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            if (patenteSuggestions.length > 0 && showSuggestions) {
                                                handleSelectPatente(patenteSuggestions[0].patente)
                                            } else {
                                                handleSearch()
                                            }
                                        } else if (e.key === 'Escape') {
                                            setShowSuggestions(false)
                                        }
                                    }}
                                />
                                {/* Suggestions Dropdown */}
                                {showSuggestions && patenteSuggestions.length > 0 && (
                                    <div
                                        ref={suggestionsRef}
                                        className="absolute z-50 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg max-h-60 overflow-auto"
                                    >
                                        {patenteSuggestions.map((vehicle, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => handleSelectPatente(vehicle.patente)}
                                                className="w-full text-left px-4 py-2 hover:bg-zinc-700 text-white flex items-center gap-2 transition-colors"
                                            >
                                                <Car className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{vehicle.patente}</div>
                                                    <div className="text-sm text-zinc-400 truncate">
                                                        {vehicle.marca} {vehicle.modelo}
                                                        {vehicle.año && ` (${vehicle.año})`}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button
                                type="button"
                                onClick={handleSearch}
                                disabled={searching || !patente.trim()}
                                variant="outline"
                            >
                                {searching ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Select Service */}
                    {services.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="service" className="text-zinc-300">
                                Seleccionar Servicio
                            </Label>
                            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                                <SelectTrigger id="service" className="bg-zinc-800 border-zinc-700 text-white">
                                    <SelectValue placeholder="Selecciona un servicio" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                    {services.map((service) => (
                                        <SelectItem
                                            key={service.id}
                                            value={service.id}
                                            className="text-white focus:bg-zinc-700"
                                        >
                                            <div className="flex flex-col">
                                                <span>Servicio #{service.numero_servicio}</span>
                                                <span className="text-xs text-zinc-400">
                                                    {service.vehicle.marca} {service.vehicle.modelo} - {service.estado}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="titulo" className="text-zinc-300">
                            Título <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ej: Problema con la pintura"
                            className="bg-zinc-800 border-zinc-700 text-white"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="contenido" className="text-zinc-300">
                            Descripción <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="contenido"
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            placeholder="Describe la información que deseas registrar..."
                            className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={loading}
                            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !selectedServiceId}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Crear Nota
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

