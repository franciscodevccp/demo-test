'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

interface RealtimeOptions {
    table: string
    filter?: string
    onInsert?: (payload: any) => void
    onUpdate?: (payload: any) => void
    onDelete?: (payload: any) => void
    enabled?: boolean
}

export function useRealtime(options: RealtimeOptions) {
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        // Mock connection
        setIsConnected(true)
        return () => {
            setIsConnected(false)
        }
    }, [])

    const unsubscribe = useCallback(() => {
        setIsConnected(false)
    }, [])

    return {
        isConnected,
        unsubscribe,
    }
}
