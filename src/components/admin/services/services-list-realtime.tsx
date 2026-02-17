'use client'

import { useState, useEffect } from 'react'
import { ServicesList } from './services-list'
import { toast } from 'sonner'
import type { ServiceWithRelations } from '@/services/services'

interface ServicesListRealtimeProps {
    initialServices: ServiceWithRelations[]
    status?: string
}

export function ServicesListRealtime({ initialServices, status }: ServicesListRealtimeProps) {
    const [services, setServices] = useState<ServiceWithRelations[]>(initialServices)

    // Update local state when initialServices change (from server)
    useEffect(() => {
        setServices(initialServices)
    }, [initialServices])

    // In a real app with Supabase, we would have realtime subscriptions here.
    // With mock data, we rely on server revalidation.

    return <ServicesList services={services} />
}
