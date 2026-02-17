'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, 'type' | 'onChange' | 'value'> {
  value?: string | number
  onChange?: (value: string) => void
  allowDecimals?: boolean
}

function CurrencyInput({ 
  className, 
  value = '', 
  onChange, 
  allowDecimals = true,
  ...props 
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState('')

  // Formatear número con separador de miles
  const formatNumber = (num: string): string => {
    if (!num) return ''
    
    // Remover todo excepto números y coma/punto decimal
    const cleaned = num.replace(/[^\d,]/g, '')
    
    // Separar parte entera y decimal
    const parts = cleaned.split(',')
    const integerPart = parts[0]
    const decimalPart = parts[1]
    
    // Agregar puntos como separador de miles
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    
    // Retornar con parte decimal si existe
    return decimalPart !== undefined ? `${formatted},${decimalPart}` : formatted
  }

  // Convertir valor formateado a número limpio
  const cleanNumber = (formatted: string): string => {
    return formatted.replace(/\./g, '').replace(',', '.')
  }

  // Actualizar display cuando cambia el value prop
  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      const stringValue = String(value)
      // Si el valor viene como número limpio (sin formato), formatearlo
      const numericValue = stringValue.replace('.', ',')
      setDisplayValue(formatNumber(numericValue))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    
    // Permitir solo números, puntos y comas
    if (input && !/^[\d.,]*$/.test(input)) {
      return
    }

    // Si no permite decimales, remover coma
    const processedInput = allowDecimals ? input : input.replace(',', '')
    
    // Formatear el valor
    const formatted = formatNumber(processedInput)
    setDisplayValue(formatted)
    
    // Enviar valor limpio al padre
    if (onChange) {
      const clean = cleanNumber(formatted)
      onChange(clean)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Al perder foco, asegurarse de que esté bien formateado
    const formatted = formatNumber(displayValue)
    setDisplayValue(formatted)
    
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  )
}

export { CurrencyInput }

