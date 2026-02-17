import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLoading() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Header skeleton */}
            <div className="flex h-14 items-center gap-4 border-b border-zinc-800 bg-black px-4">
                <Skeleton className="h-7 w-7 bg-zinc-800" />
                <div className="h-6 w-px bg-zinc-800" />
                <Skeleton className="h-5 w-32 bg-zinc-800" />
            </div>

            <div className="flex-1 p-6 space-y-6">
                {/* Title skeleton */}
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 bg-zinc-800" />
                    <Skeleton className="h-4 w-48 bg-zinc-800" />
                </div>

                {/* Stats cards skeleton */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                            <Skeleton className="h-4 w-24 bg-zinc-800 mb-2" />
                            <Skeleton className="h-8 w-16 bg-zinc-800" />
                        </div>
                    ))}
                </div>

                {/* Content skeleton */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="lg:col-span-2 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                        <Skeleton className="h-6 w-40 bg-zinc-800 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
                            ))}
                        </div>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
                        <Skeleton className="h-6 w-32 bg-zinc-800 mb-4" />
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((i) => (
                                <Skeleton key={i} className="h-12 w-full bg-zinc-800" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
