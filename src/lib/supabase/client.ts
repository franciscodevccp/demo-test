
// Mock createClient to prevent accidental usages
export function createClient() {
    console.warn('Attempted to create Supabase browser client. This function is neutralized in mock mode.')
    return {
        from: () => ({
            select: () => ({ error: null, data: [] }),
            insert: () => ({ error: null, data: [] }),
            update: () => ({ error: null, data: [] }),
            delete: () => ({ error: null, data: [] }),
            upload: () => ({ error: null, data: [] }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
            on: () => ({ subscribe: () => { } }),
            channel: () => ({
                on: () => ({ subscribe: () => { } }),
                subscribe: () => { }
            })
        }),
        auth: {
            getUser: async () => ({ data: { user: null }, error: null }),
            getSession: async () => ({ data: { session: null }, error: null }),
            signInWithPassword: async () => ({ data: { user: null }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        },
        storage: {
            from: () => ({
                upload: async () => ({ error: null, data: {} }),
                getPublicUrl: () => ({ data: { publicUrl: '' } }),
                remove: async () => ({ error: null }),
            })
        },
        channel: () => ({
            on: () => ({ subscribe: () => { } }),
            subscribe: () => { }
        }),
        removeChannel: () => { }
    } as any
}
