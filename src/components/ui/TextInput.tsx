'use client'
import * as React from 'react'
import { RiCloseCircleFill } from 'react-icons/ri'
import { cn } from '@/lib/utils'

interface TextInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  icon?: React.ReactNode
  placeholder?: string
  className?: string
  showClearButton?: boolean
  disabled?: boolean
  type?: 'text' | 'email'
  error?: string
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      value,
      onChange,
      label,
      icon,
      placeholder = '',
      className,
      showClearButton = false,
      disabled = false,
      type = 'text',
      error,
    },
    ref
  ) => {
    const hasIcon = !!icon
    const hasClearButton = showClearButton && value

    const paddingLeft = hasIcon ? 'pl-10' : 'pl-4'
    const paddingRight = hasClearButton ? 'pr-10' : 'pr-4'

    const handleClear = () => {
      onChange('')
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    }

    return (
      <div className={cn('relative w-full', className)}>
        {label && (
          <label className="absolute -top-2.5 left-2 bg-white px-1 text-sm text-gray-600 pointer-events-none z-10">
            {label}
          </label>
        )}

        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-900 pointer-events-none z-10">
            {icon}
          </div>
        )}

        <input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full py-3 border border-muted-300 rounded focus:outline-none focus:border-muted-500 bg-white',
            paddingLeft,
            paddingRight,
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500'
          )}
        />

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

TextInput.displayName = 'TextInput'

export { TextInput }