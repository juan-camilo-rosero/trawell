import * as React from "react"
import { RiCloseCircleFill } from 'react-icons/ri'
import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  label?: string
  icon?: React.ReactNode
  showClearButton?: boolean
  onClear?: () => void
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, icon, showClearButton = false, onClear, ...props }, ref) => {
    const hasIcon = !!icon
    const hasClearButton = showClearButton && props.value
    
    // Si tiene label, icon o clearButton, usar el estilo mejorado
    const hasEnhancedStyle = label || icon || showClearButton

    if (!hasEnhancedStyle) {
      // Render del input original sin modificaciones
      return (
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
      )
    }

    // Render del input con estilo mejorado
    const paddingLeft = hasIcon ? 'pl-10' : 'pl-4'
    const paddingRight = hasClearButton ? 'pr-10' : 'pr-4'

    const handleClear = () => {
      if (onClear) {
        onClear()
      }
    }

    return (
      <div className={cn("relative w-full", className)}>
        {label && (
          <label 
            className="absolute -top-2.5 left-2 bg-white px-1 text-sm text-gray-600 pointer-events-none"
          >
            {label}
          </label>
        )}
        
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          type={type}
          className={cn(
            "w-full py-3 border border-muted-300 rounded focus:outline-none focus:border-muted-500",
            paddingLeft,
            paddingRight
          )}
          ref={ref}
          {...props}
        />

        {hasClearButton && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
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

Input.displayName = "Input"

export { Input }