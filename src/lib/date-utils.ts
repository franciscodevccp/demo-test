/**
 * Obtiene la fecha y hora actual en la zona horaria de Santiago (America/Santiago)
 */
export function getSantiagoDateTime(): { fecha: string; hora: string } {
    const now = new Date()
    
    // Convertir a hora de Santiago (America/Santiago)
    const santiagoTime = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(now)

    const fecha = `${santiagoTime.find(p => p.type === 'year')?.value}-${santiagoTime.find(p => p.type === 'month')?.value}-${santiagoTime.find(p => p.type === 'day')?.value}`
    const hora = `${santiagoTime.find(p => p.type === 'hour')?.value}:${santiagoTime.find(p => p.type === 'minute')?.value}`

    return { fecha, hora }
}

/**
 * Obtiene la fecha y hora actual en formato ISO en la zona horaria de Santiago
 */
export function getSantiagoISOString(): string {
    const now = new Date()
    
    // Usar Intl.DateTimeFormat para obtener la fecha/hora en Santiago
    const santiagoFormatter = new Intl.DateTimeFormat('sv-SE', {
        timeZone: 'America/Santiago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    })

    const parts = santiagoFormatter.formatToParts(now)
    const year = parts.find(p => p.type === 'year')?.value
    const month = parts.find(p => p.type === 'month')?.value
    const day = parts.find(p => p.type === 'day')?.value
    const hour = parts.find(p => p.type === 'hour')?.value
    const minute = parts.find(p => p.type === 'minute')?.value
    const second = parts.find(p => p.type === 'second')?.value

    return `${year}-${month}-${day}T${hour}:${minute}:${second}-03:00`
}

