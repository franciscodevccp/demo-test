'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X } from 'lucide-react'
import { useState, useTransition } from 'react'
import type { ServiceStatus } from '@/types/database'

interface ServicesFiltersProps {
    currentStatus: ServiceStatus | 'all'
    currentSearch: string
}

const statusOptions = [
    { value: 'all', label: 'Todos', color: 'bg-zinc-700' },
    { value: 'pendiente', label: 'Pendientes', color: 'bg-amber-600' },
    { value: 'en_proceso', label: 'En Proceso', color: 'bg-blue-600' },
    { value: 'completado', label: 'Completados', color: 'bg-green-600' },
    { value: 'cancelado', label: 'Cancelados', color: 'bg-red-600' },
]

export function ServicesFilters({ currentStatus, currentSearch }: ServicesFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [search, setSearch] = useState(currentSearch)

    function updateFilters(params: { estado?: string; buscar?: string }) {
        const newParams = new URLSearchParams(searchParams.toString())

        if (params.estado !== undefined) {
            if (params.estado === 'all') {
                newParams.delete('estado')
            } else {
                newParams.set('estado', params.estado)
            }
        }

        if (params.buscar !== undefined) {
            if (params.buscar === '') {
                newParams.delete('buscar')
            } else {
                newParams.set('buscar', params.buscar)
            }
        }

        startTransition(() => {
            router.push(`/admin/servicios?${newParams.toString()}`)
        })
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        updateFilters({ buscar: search })
    }

    function clearSearch() {
        setSearch('')
        updateFilters({ buscar: '' })
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                    <Button
                        key={option.value}
                        variant={currentStatus === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateFilters({ estado: option.value })}
                        disabled={isPending}
                        className={
                            currentStatus === option.value
                                ? `${option.color} text-white border-transparent hover:opacity-90`
                                : 'border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800'
                        }
                    >
                        {option.label}
                    </Button>
                ))}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        type="text"
                        placeholder="Buscar por patente, cliente..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-64 pl-9 h-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-red-500"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <Button
                    type="submit"
                    size="sm"
                    disabled={isPending}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white"
                >
                    Buscar
                </Button>
            </form>
        </div>
    )
}
