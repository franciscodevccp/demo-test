'use client'

import { useState, useEffect, useCallback } from 'react'
import { ServicesList } from './services-list'
import { toast } from 'sonner'
import type { AvailableService } from '@/services/worker-services'
// import { useRealtime } from '@/hooks/use-realtime' // Mocked hook does nothing really useful now

interface ServicesListRealtimeProps {
    initialServices: AvailableService[]
    workerId: string
    workerRole: string
}

export function ServicesListRealtime({ initialServices, workerId, workerRole }: ServicesListRealtimeProps) {
    const [services, setServices] = useState<AvailableService[]>(initialServices)

    // Update local state when initialServices change (from server)
    useEffect(() => {
        setServices(initialServices)
    }, [initialServices])

    // In a real app with Supabase, we would have realtime subscriptions here.
    // With mock data, we rely on server revalidation (using router.refresh() in parent or actions).
    // Or we could poll if we really wanted to simulate updates from "other" users.

    return <ServicesList services={services} workerId={workerId} workerRole={workerRole} />
}
