import { validate as uuidValidate } from 'uuid'

/**
 * Validates if a string is a valid UUID v4
 * @param id - The ID string to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(id: string): boolean {
    if (!id || typeof id !== 'string') {
        return false
    }
    return uuidValidate(id)
}

/**
 * Validates UUID and throws error if invalid
 * @param id - The ID string to validate
 * @throws Error if invalid UUID
 */
export function validateUUID(id: string): void {
    if (!isValidUUID(id)) {
        throw new Error('Invalid UUID format')
    }
}
