/**
 * Rate limiting utility for API endpoints
 * Uses Upstash Redis for production, falls back to in-memory for development
 */

// In-memory store for development (falls back if Redis is not configured)
const inMemoryStore = new Map<string, { count: number; resetTime: number }>()

interface RateLimitConfig {
    limit: number // Number of requests allowed
    window: number // Time window in seconds
}

interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    reset: number
}

/**
 * Rate limiter using in-memory storage (for development)
 */
async function rateLimitInMemory(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    const now = Date.now()
    const windowMs = config.window * 1000
    const key = identifier

    const record = inMemoryStore.get(key)

    if (!record || now > record.resetTime) {
        // New window or expired window
        inMemoryStore.set(key, {
            count: 1,
            resetTime: now + windowMs
        })
        
        // Clean up old entries periodically
        if (inMemoryStore.size > 1000) {
            for (const [k, v] of inMemoryStore.entries()) {
                if (now > v.resetTime) {
                    inMemoryStore.delete(k)
                }
            }
        }

        return {
            success: true,
            limit: config.limit,
            remaining: config.limit - 1,
            reset: now + windowMs
        }
    }

    if (record.count >= config.limit) {
        return {
            success: false,
            limit: config.limit,
            remaining: 0,
            reset: record.resetTime
        }
    }

    record.count++
    return {
        success: true,
        limit: config.limit,
        remaining: config.limit - record.count,
        reset: record.resetTime
    }
}

/**
 * Rate limiter using Upstash Redis (for production)
 */
async function rateLimitRedis(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    try {
        // Dynamic import to avoid issues if Upstash is not configured
        const { Ratelimit } = await import('@upstash/ratelimit')
        const { Redis } = await import('@upstash/redis')

        if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
            // Fall back to in-memory if Redis is not configured
            return rateLimitInMemory(identifier, config)
        }

        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })

        const ratelimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(config.limit, `${config.window} s`),
            analytics: true,
        })

        const result = await ratelimit.limit(identifier)

        return {
            success: result.success,
            limit: config.limit,
            remaining: result.limit - result.remaining,
            reset: result.reset,
        }
    } catch (error) {
        console.error('Error with Redis rate limiting, falling back to in-memory:', error)
        // Fall back to in-memory if Redis fails
        return rateLimitInMemory(identifier, config)
    }
}

/**
 * Rate limit check
 * @param identifier - Unique identifier (e.g., IP address, user ID, email)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export async function rateLimit(
    identifier: string,
    config: RateLimitConfig
): Promise<RateLimitResult> {
    // Use Redis if environment variables are set, otherwise use in-memory
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        return rateLimitRedis(identifier, config)
    }
    
    return rateLimitInMemory(identifier, config)
}

/**
 * Get client IP address from request headers
 */
export function getClientIP(headers: Headers): string {
    // Check various headers for real IP (handles proxies)
    const forwarded = headers.get('x-forwarded-for')
    if (forwarded) {
        return forwarded.split(',')[0].trim()
    }
    
    const realIP = headers.get('x-real-ip')
    if (realIP) {
        return realIP
    }

    // Fallback
    return 'unknown'
}
