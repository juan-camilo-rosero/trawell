'use client'

import * as React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { RiCloseCircleFill } from 'react-icons/ri'
import { cn } from '@/lib/utils'

interface DateInputProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  label?: string
  icon?: React.ReactNode
  placeholder?: string
  className?: string
  showClearButton?: boolean
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
}

function formatDate(date: Date | undefined): string {
  if (!date) return ''
  
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const DateInput = React.forwardRef<HTMLDivElement, DateInputProps>(
  ({ 
    value, 
    onChange, 
    label, 
    icon, 
    placeholder = 'Seleccionar fecha',
    className,
    showClearButton = false,
    disabled = false,
    minDate,
    maxDate
  }, ref) => {
    const [open, setOpen] = React.useState(false)
    const [month, setMonth] = React.useState<Date | undefined>(value)
    const displayValue = formatDate(value)
    
    const hasIcon = !!icon
    const hasClearButton = showClearButton && value
    
    const paddingLeft = hasIcon ? 'pl-10' : 'pl-4'
    const paddingRight = hasClearButton ? 'pr-10' : 'pr-4'

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange(undefined)
    }

    const handleSelect = (date: Date | undefined) => {
      onChange(date)
      setOpen(false)
    }

    React.useEffect(() => {
      if (value) {
        setMonth(value)
      }
    }, [value])

    return (
      <div ref={ref} className={cn("relative w-full", className)}>
        {label && (
          <label 
            className="absolute -top-2.5 left-2 bg-white px-1 text-sm text-gray-600 pointer-events-none z-10"
          >
            {label}
          </label>
        )}
        
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none z-10">
            {icon}
          </div>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              className={cn(
                "w-full py-3 border border-muted-300 rounded focus:outline-none focus:border-muted-500 text-left bg-white",
                paddingLeft,
                paddingRight,
                !displayValue && "text-gray-400",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={disabled}
            >
              {displayValue || placeholder}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-auto p-0" 
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleSelect}
              month={month}
              onMonthChange={setMonth}
              captionLayout="dropdown"
              disabled={(date) => {
                if (minDate && date < minDate) return true
                if (maxDate && date > maxDate) return true
                return false
              }}
            />
          </PopoverContent>
        </Popover>

        {hasClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors z-10"
            aria-label="Limpiar"
            tabIndex={-1}
          >
            <RiCloseCircleFill size={20} />
          </button>
        )}
      </div>
    )
  }
)

DateInput.displayName = 'DateInput'

export { DateInput }