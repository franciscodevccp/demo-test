'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Plus,
    X,
    Wrench,
    Package,
    DollarSign,
    Percent,
    Loader2,
    Save,
    Trash2,
    AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { updateService } from '@/actions/services'
import { toast } from 'sonner'
import type { UserRole } from '@/types/database'
import { Separator } from '@/components/ui/separator'

interface Task {
    id: string
    descripcion: string
    costo_mano_obra: number
    panos: number
}

interface Part {
    id: string
    nombre_repuesto: string
    cantidad: number
    precio_unitario: number
}

interface Expense {
    id: string
    descripcion: string
    monto: number
}

interface Commission {
    id: string
    worker_role: string
    monto_base: number
    porcentaje: number
    monto_comision: number
}

interface EditarServicioFormProps {
    serviceId: string
    service: any
    vehicle: any
    customer: any
}

export function EditarServicioForm({ serviceId, service, vehicle, customer }: EditarServicioFormProps) {
    const [isPending, startTransition] = useTransition()

    // Form states - Initialize with existing data
    const [fechaInicio, setFechaInicio] = useState(service.fecha_inicio || '')
    const [horaInicio, setHoraInicio] = useState(service.hora_inicio || '')
    const [fechaEstimada, setFechaEstimada] = useState(service.fecha_estimada_finalizacion || '')
    const [descripcion, setDescripcion] = useState(service.descripcion_inicial || '')

    // Lists - Initialize with existing data
    const [tasks, setTasks] = useState<Task[]>(
        (service.tasks || []).map((t: any) => ({
            id: crypto.randomUUID(),
            descripcion: t.descripcion,
            costo_mano_obra: Number(t.costo_mano_obra) || 0,
            panos: Number(t.panos) || 0,
        }))
    )
    const [parts, setParts] = useState<Part[]>(
        (service.parts || []).map((p: any) => ({
            id: crypto.randomUUID(),
            nombre_repuesto: p.nombre_repuesto,
            cantidad: Number(p.cantidad) || 0,
            precio_unitario: Number(p.precio_unitario) || 0,
        }))
    )
    const [expenses, setExpenses] = useState<Expense[]>(
        (service.expenses || []).map((e: any) => ({
            id: crypto.randomUUID(),
            descripcion: e.descripcion,
            monto: Number(e.monto) || 0,
        }))
    )
    const [commissions, setCommissions] = useState<Commission[]>(
        (service.commissions || []).filter((c: any) => c.worker_role === 'mecanico' || c.worker_role === 'desabolladura').map((c: any) => ({
            id: crypto.randomUUID(),
            worker_role: c.worker_role,
            monto_base: Number(c.monto_base) || 0,
            porcentaje: Number(c.porcentaje) || 0,
            monto_comision: Number(c.monto_comision) || 0,
        }))
    )

    // New item states
    const [newTask, setNewTask] = useState({ descripcion: '', costo_mano_obra: 0, panos: 0 })
    const [newPart, setNewPart] = useState({ nombre_repuesto: '', cantidad: 1, precio_unitario: 0 })
    const [newExpense, setNewExpense] = useState({ descripcion: '', monto: 0 })

    // Unsaved data warning
    const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)
    const [pendingSubmit, setPendingSubmit] = useState(false)

    // Helper to format currency
    function formatCurrency(value: number) {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
        }).format(value)
    }

    // Helper to calculate commission
    function calculateCommission(base: number, percentage: number): number {
        return (base * percentage) / 100
    }

    // Helper to get role label
    function getRoleLabel(role: string): string {
        const labels: Record<string, string> = {
            mecanico: 'Mecánico',
            desabolladura: 'Desabollador',
        }
        return labels[role] || role.charAt(0).toUpperCase() + role.slice(1)
    }

    // Add/Remove task functions
    const addTask = () => {
        if (!newTask.descripcion) {
            toast.error('La descripción de la tarea es requerida')
            return
        }
        setTasks([...tasks, { ...newTask, id: crypto.randomUUID() }])
        setNewTask({ descripcion: '', costo_mano_obra: 0, panos: 0 })
        toast.success('Tarea agregada')
    }

    const removeTask = (id: string) => {
        setTasks(tasks.filter(t => t.id !== id))
        toast.success('Tarea eliminada')
    }

    // Add/Remove part functions
    const addPart = () => {
        if (!newPart.nombre_repuesto) {
            toast.error('El nombre del repuesto es requerido')
            return
        }
        setParts([...parts, { ...newPart, id: crypto.randomUUID() }])
        setNewPart({ nombre_repuesto: '', cantidad: 1, precio_unitario: 0 })
        toast.success('Repuesto agregado')
    }

    const removePart = (id: string) => {
        setParts(parts.filter(p => p.id !== id))
        toast.success('Repuesto eliminado')
    }

    // Add/Remove expense functions
    const addExpense = () => {
        if (!newExpense.descripcion) {
            toast.error('La descripción del costo es requerida')
            return
        }
        setExpenses([...expenses, { ...newExpense, id: crypto.randomUUID() }])
        setNewExpense({ descripcion: '', monto: 0 })
        toast.success('Costo agregado')
    }

    const removeExpense = (id: string) => {
        setExpenses(expenses.filter(e => e.id !== id))
        toast.success('Costo eliminado')
    }

    // Commission management
    const updateCommission = (role: 'mecanico' | 'desabolladura', monto: number, porcentaje: number) => {
        const comision = calculateCommission(monto, porcentaje)
        const existingIndex = commissions.findIndex(c => c.worker_role === role)

        if (existingIndex >= 0) {
            const updated = [...commissions]
            updated[existingIndex] = {
                ...updated[existingIndex],
                monto_base: monto,
                porcentaje: porcentaje,
                monto_comision: comision
            }
            setCommissions(updated)
        } else {
            setCommissions([...commissions, {
                id: crypto.randomUUID(),
                worker_role: role,
                monto_base: monto,
                porcentaje: porcentaje,
                monto_comision: comision
            }])
        }
    }

    // Calculate totals
    const tasksTotal = tasks.reduce((sum, t) => sum + (t.costo_mano_obra || 0), 0)
    const partsTotal = parts.reduce((sum, p) => sum + ((p.cantidad || 0) * (p.precio_unitario || 0)), 0)
    const expensesTotal = expenses.reduce((sum, e) => sum + (e.monto || 0), 0)
    const totalService = tasksTotal + partsTotal + expensesTotal

    // Check if there's unsaved data in input fields
    function hasUnsavedData() {
        const hasUnsavedTask = newTask.descripcion.trim() !== '' || newTask.costo_mano_obra > 0 || newTask.panos > 0
        const hasUnsavedPart = newPart.nombre_repuesto.trim() !== '' || newPart.precio_unitario > 0
        const hasUnsavedExpense = newExpense.descripcion.trim() !== '' || newExpense.monto > 0

        return hasUnsavedTask || hasUnsavedPart || hasUnsavedExpense
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!fechaInicio || !horaInicio) {
            toast.error('Fecha y hora de inicio son requeridos')
            return
        }

        if (tasks.length === 0) {
            toast.error('Debe agregar al menos una tarea')
            return
        }

        // Check for unsaved data
        if (hasUnsavedData() && !pendingSubmit) {
            setShowUnsavedWarning(true)
            return
        }

        // Reset pending submit flag
        setPendingSubmit(false)

        // Proceed with submission
        submitService()
    }

    async function submitService() {
        startTransition(async () => {
            // Don't use try/catch here because redirect() throws a special Next.js error
            await updateService(serviceId, {
                descripcionInicial: descripcion,
                fechaInicio,
                horaInicio,
                fechaEstimada: fechaEstimada || null,
                tasks: tasks.map(t => ({
                    descripcion: t.descripcion,
                    costo_mano_obra: t.costo_mano_obra,
                    panos: t.panos
                })),
                parts: parts.map(p => ({
                    nombre_repuesto: p.nombre_repuesto,
                    cantidad: p.cantidad,
                    precio_unitario: p.precio_unitario
                })),
                expenses: expenses.map(e => ({
                    descripcion: e.descripcion,
                    monto: e.monto
                })),
                commissions: commissions.map(c => ({
                    worker_role: c.worker_role,
                    monto_base: c.monto_base,
                    porcentaje: c.porcentaje,
                    monto_comision: c.monto_comision
                }))
            })
        })
    }

    function handleConfirmSubmit() {
        setPendingSubmit(true)
        setShowUnsavedWarning(false)
        // Trigger form submission
        const form = document.querySelector('form')
        if (form) {
            form.requestSubmit()
        }
    }

    // Quick date buttons
    const addDays = (days: number) => {
        const date = new Date(fechaInicio)
        date.setDate(date.getDate() + days)
        setFechaEstimada(date.toISOString().split('T')[0])
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle & Customer Info (Read-only) */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-zinc-400">Vehículo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-xl font-mono font-bold text-white bg-zinc-800 inline-block px-3 py-1 rounded">
                            {vehicle?.patente}
                        </p>
                        <p className="text-zinc-300">
                            {vehicle?.marca} {vehicle?.modelo}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-zinc-400">Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-lg font-semibold text-white">
                            {customer?.nombre}
                        </p>
                        {customer?.telefono && (
                            <p className="text-sm text-zinc-400">{customer.telefono}</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Service Details & Description */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Detalles del Servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-zinc-400">Fecha de Inicio</Label>
                                <Input
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="bg-zinc-900 border-zinc-700 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <Label className="text-zinc-400">Hora de Inicio</Label>
                                <Input
                                    type="time"
                                    value={horaInicio}
                                    onChange={(e) => setHoraInicio(e.target.value)}
                                    className="bg-zinc-900 border-zinc-700 text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-zinc-400">Fecha Estimada de Finalización</Label>
                            <Input
                                type="date"
                                value={fechaEstimada}
                                onChange={(e) => setFechaEstimada(e.target.value)}
                                className="bg-zinc-900 border-zinc-700 text-white"
                            />
                            <div className="flex gap-2 mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addDays(3)}
                                    className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    3 días
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addDays(7)}
                                    className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    7 días
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addDays(14)}
                                    className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                                >
                                    14 días
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white">Descripción Inicial</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Describe el problema o trabajo solicitado..."
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 min-h-[180px]"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Tasks */}
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-blue-400" />
                        Tareas a Realizar
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Agrega las tareas del servicio con costo y paños
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* List of tasks */}
                    {tasks.length > 0 && (
                        <div className="space-y-2">
                            {tasks.map(task => (
                                <div
                                    key={task.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                                >
                                    <div className="flex-1">
                                        <p className="text-zinc-200">{task.descripcion}</p>
                                        <p className="text-sm text-zinc-500">
                                            {formatCurrency(task.costo_mano_obra)} • {task.panos} paño(s)
                                        </p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeTask(task.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            <Separator className="bg-zinc-700" />
                        </div>
                    )}

                    {/* Add new task */}
                    <div className="space-y-2">
                        <Input
                            placeholder="Descripción de la tarea"
                            value={newTask.descripcion}
                            onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })}
                            className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                        />
                        <div className="grid grid-cols-[1fr,1fr,auto] gap-2">
                            <CurrencyInput
                                placeholder="Costo"
                                value={newTask.costo_mano_obra || ''}
                                onChange={(value) => setNewTask({ ...newTask, costo_mano_obra: Number(value) || 0 })}
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                allowDecimals={false}
                            />
                            <Input
                                type="number"
                                placeholder="Paños"
                                value={newTask.panos || ''}
                                onChange={(e) => setNewTask({ ...newTask, panos: Number(e.target.value) })}
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                            <Button
                                type="button"
                                onClick={addTask}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Parts & Expenses */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Parts */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Package className="h-5 w-5 text-green-400" />
                            Repuestos Utilizados
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Agrega los repuestos necesarios para el servicio
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* List of parts */}
                        {parts.length > 0 && (
                            <div className="space-y-2">
                                {parts.map(part => (
                                    <div
                                        key={part.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                                    >
                                        <div className="flex-1">
                                            <p className="text-zinc-200">{part.nombre_repuesto}</p>
                                            <p className="text-sm text-zinc-500">
                                                {part.cantidad}x {formatCurrency(part.precio_unitario)} = {formatCurrency(part.cantidad * part.precio_unitario)}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removePart(part.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Separator className="bg-zinc-700" />
                            </div>
                        )}

                        {/* Add new part */}
                        <div className="space-y-2">
                            <Input
                                placeholder="Nombre del repuesto"
                                value={newPart.nombre_repuesto}
                                onChange={(e) => setNewPart({ ...newPart, nombre_repuesto: e.target.value })}
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                            <div className="grid grid-cols-[auto,1fr,auto] gap-2">
                                <Input
                                    type="number"
                                    placeholder="1"
                                    value={newPart.cantidad || ''}
                                    onChange={(e) => setNewPart({ ...newPart, cantidad: Number(e.target.value) })}
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 w-20"
                                />
                                <CurrencyInput
                                    placeholder="Precio"
                                    value={newPart.precio_unitario || ''}
                                    onChange={(value) => setNewPart({ ...newPart, precio_unitario: Number(value) || 0 })}
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    allowDecimals={false}
                                />
                                <Button
                                    type="button"
                                    onClick={addPart}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Expenses */}
                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-amber-400" />
                            Costos del Servicio
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Costos del servicio
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* List of expenses */}
                        {expenses.length > 0 && (
                            <div className="space-y-2">
                                {expenses.map(expense => (
                                    <div
                                        key={expense.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700"
                                    >
                                        <div className="flex-1">
                                            <p className="text-zinc-200">{expense.descripcion}</p>
                                            <p className="text-sm text-zinc-500">
                                                {formatCurrency(expense.monto)}
                                            </p>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeExpense(expense.id)}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Separator className="bg-zinc-700" />
                            </div>
                        )}

                        {/* Add new expense */}
                        <div className="space-y-2">
                            <Input
                                placeholder="Descripción del costo"
                                value={newExpense.descripcion}
                                onChange={(e) => setNewExpense({ ...newExpense, descripcion: e.target.value })}
                                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                            />
                            <div className="grid grid-cols-[1fr,auto] gap-2">
                                <CurrencyInput
                                    placeholder="Monto"
                                    value={newExpense.monto || ''}
                                    onChange={(value) => setNewExpense({ ...newExpense, monto: Number(value) || 0 })}
                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                    allowDecimals={false}
                                />
                                <Button
                                    type="button"
                                    onClick={addExpense}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Commissions */}
            <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                    <CardTitle className="text-lg text-white flex items-center gap-2">
                        <Percent className="h-5 w-5 text-purple-400" />
                        Comisiones por Rol
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Ingresa el monto y porcentaje de comisión
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        {(['mecanico', 'desabolladura'] as const).map((role) => {
                            const commission = commissions.find(c => c.worker_role === role)
                            return (
                                <div key={role} className="space-y-3 p-4 rounded-lg border border-zinc-700 bg-zinc-800/30">
                                    <h4 className="font-semibold text-white">{getRoleLabel(role)}</h4>
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs text-zinc-500">Monto $</Label>
                                                <CurrencyInput
                                                    placeholder="0"
                                                    value={commission?.monto_base || ''}
                                                    onChange={(value) => updateCommission(
                                                        role,
                                                        Number(value) || 0,
                                                        commission?.porcentaje || 0
                                                    )}
                                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                                    allowDecimals={false}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs text-zinc-500">%</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={commission?.porcentaje || ''}
                                                    onChange={(e) => updateCommission(
                                                        role,
                                                        commission?.monto_base || 0,
                                                        Number(e.target.value)
                                                    )}
                                                    className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                />
                                            </div>
                                        </div>
                                        <div className="p-2 bg-green-950/30 border border-green-800/30 rounded">
                                            <p className="text-sm text-zinc-500">Comisión</p>
                                            <p className="text-lg font-semibold text-green-400">
                                                {formatCurrency(commission?.monto_comision || 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Total Summary */}
            <Card className="border-zinc-800 bg-gradient-to-br from-red-950/20 via-zinc-900 to-zinc-900/50">
                <CardHeader>
                    <CardTitle className="text-base text-zinc-400">Total del Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-4xl font-bold text-white mb-4">
                        {formatCurrency(totalService)}
                    </p>
                    <Separator className="bg-zinc-700 mb-4" />
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Mano de obra</span>
                            <span className="text-zinc-300 font-semibold">{formatCurrency(tasksTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Repuestos</span>
                            <span className="text-zinc-300 font-semibold">{formatCurrency(partsTotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-zinc-500">Costos del servicio</span>
                            <span className="text-zinc-300 font-semibold">{formatCurrency(expensesTotal)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-zinc-800 bg-black p-4 flex justify-end gap-3 lg:pl-[256px]">
                <Link href={`/admin/servicios/${serviceId}`}>
                    <Button
                        type="button"
                        variant="outline"
                        className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    >
                        Cancelar
                    </Button>
                </Link>
                <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Actualizando...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4 mr-2" />
                            Actualizar Servicio
                        </>
                    )}
                </Button>
            </div>

            {/* Unsaved Data Warning Dialog */}
            <AlertDialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
                <AlertDialogContent className="bg-zinc-900 border-zinc-800">
                    <AlertDialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                                <AlertTriangle className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <AlertDialogTitle className="text-white">
                                    Tienes datos sin guardar
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                    Hay información en los campos que no has agregado a la lista
                                </AlertDialogDescription>
                            </div>
                        </div>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                        <p className="text-sm text-zinc-300">Los siguientes campos tienen datos sin guardar:</p>
                        <ul className="space-y-1 text-sm text-zinc-400">
                            {(newTask.descripcion.trim() !== '' || newTask.costo_mano_obra > 0 || newTask.panos > 0) && (
                                <li className="flex items-center gap-2">
                                    <Wrench className="h-4 w-4 text-red-400" />
                                    <span>Tarea sin agregar</span>
                                </li>
                            )}
                            {(newPart.nombre_repuesto.trim() !== '' || newPart.precio_unitario > 0) && (
                                <li className="flex items-center gap-2">
                                    <Package className="h-4 w-4 text-green-400" />
                                    <span>Repuesto sin agregar</span>
                                </li>
                            )}
                            {(newExpense.descripcion.trim() !== '' || newExpense.monto > 0) && (
                                <li className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-amber-400" />
                                    <span>Costo sin agregar</span>
                                </li>
                            )}
                        </ul>
                        <p className="text-sm text-zinc-500 mt-4">
                            ¿Deseas continuar sin guardar estos datos?
                        </p>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800">
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmSubmit}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Continuar sin guardar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    )
}

