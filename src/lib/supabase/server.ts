
// Mock createClient to prevent accidental usages
export async function createClient() {
    console.warn('Attempted to create Supabase server client. This function is neutralized in mock mode.')
    return {
        from: () => ({
            select: () => ({ error: null, data: [] }),
            insert: () => ({ error: null, data: [] }),
            update: () => ({ error: null, data: [] }),
            delete: () => ({ error: null, data: [] }),
            upload: () => ({ error: null, data: [] }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
            on: () => ({ subscribe: () => { } }),
        }),
        auth: {
            getUser: async () => ({ data: { user: null }, error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
            signInWithPassword: async () => ({ data: { user: null }, error: null }),
            signOut: async () => ({ error: null }),
        },
        storage: {
            from: () => ({
                upload: async () => ({ error: null, data: {} }),
                getPublicUrl: () => ({ data: { publicUrl: '' } }),
                remove: async () => ({ error: null }),
            })
        }
    } as any
}
