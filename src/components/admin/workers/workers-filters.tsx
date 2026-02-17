'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, ArrowUpDown } from 'lucide-react'
import { useState, useTransition, useEffect, useRef } from 'react'

interface WorkersFiltersProps {
    currentSort: 'recientes' | 'antiguos'
    currentSearch: string
}

export function WorkersFilters({ currentSort, currentSearch }: WorkersFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [search, setSearch] = useState(currentSearch)
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current)
            }
        }
    }, [])

    function updateFilters(params: { orden?: string; buscar?: string }) {
        const newParams = new URLSearchParams(searchParams.toString())

        if (params.orden !== undefined) {
            if (params.orden === 'recientes') {
                newParams.delete('orden')
            } else {
                newParams.set('orden', params.orden)
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
            router.push(`/admin/trabajadores?${newParams.toString()}`)
        })
    }

    function handleSearchChange(value: string) {
        setSearch(value)

        // Clear previous timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }

        // Set new timeout for auto search (400ms delay)
        searchTimeoutRef.current = setTimeout(() => {
            updateFilters({ buscar: value })
        }, 400)
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault()
        // Clear timeout if form is submitted manually
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
        updateFilters({ buscar: search })
    }

    function clearSearch() {
        setSearch('')
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current)
        }
        updateFilters({ buscar: '' })
    }

    return (
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Sort Filter */}
            <div className="flex gap-2">
                <Button
                    variant={currentSort === 'recientes' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilters({ orden: 'recientes' })}
                    disabled={isPending}
                    className={
                        currentSort === 'recientes'
                            ? 'bg-blue-600 text-white border-transparent hover:opacity-90'
                            : 'border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }
                >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Más Recientes
                </Button>
                <Button
                    variant={currentSort === 'antiguos' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateFilters({ orden: 'antiguos' })}
                    disabled={isPending}
                    className={
                        currentSort === 'antiguos'
                            ? 'bg-zinc-700 text-white border-transparent hover:opacity-90'
                            : 'border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }
                >
                    Más Antiguos
                </Button>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 sm:ml-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
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

