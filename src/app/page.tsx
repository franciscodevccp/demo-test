'use client'

import { useState } from 'react'
import Image from 'next/image'
import { loginAsAdmin } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black" />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Red glow accent */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[800px] bg-red-500/10 blur-[120px] rounded-full" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="relative mb-4 h-20 w-64">
            <Image
              src="/logo.webp"
              alt="Innovautos"
              fill
              className="object-contain"
              priority
            />
          </div>
          <p className="text-sm tracking-wider uppercase text-zinc-500">
            Sistema de Gestión
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-semibold text-white">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={() => {
              setIsLoading(true)
              loginAsAdmin().catch((error) => {
                if (error.message && error.message.includes('NEXT_REDIRECT')) {
                  return
                }
                toast.error('Error al iniciar sesión')
                setIsLoading(false)
              })
            }}>
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 w-full bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/20 text-lg font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Ingresar como Administrador'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          Innovautos Concepción © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
