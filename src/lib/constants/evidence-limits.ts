import type { UserRole } from '@/types/database'

export interface EvidenceLimits {
    maxImages: number
    maxVideos: number
}

/**
 * Obtiene los límites de evidencia según el rol del usuario
 * - Mecánicos: 20 imágenes y 5 videos
 * - Admin y otros trabajadores: 15 imágenes y 3 videos
 */
export function getEvidenceLimits(role: UserRole | string | null | undefined): EvidenceLimits {
    if (role === 'mecanico') {
        return {
            maxImages: 20,
            maxVideos: 5,
        }
    }

    // Admin y todos los demás trabajadores
    return {
        maxImages: 15,
        maxVideos: 3,
    }
}

