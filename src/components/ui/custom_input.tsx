'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface CustomInputProps {
  type: 'text' | 'password'
  placeholder: string
  value: string
  setValue: (value: string) => void
}

function CustomInput({ type, placeholder, value, setValue }: CustomInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  
  const isPassword = type === 'password'
  const inputType = isPassword && !showPassword ? 'password' : 'text'
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }
  
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }
  
  return (
    <div className="relative w-full">
      <input
        type={inputType}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full text-xl md:text-lg lg:text-base bg-transparent border-0 border-b border-muted-900 px-0 py-3 text-muted-900 placeholder-muted-500 focus:outline-none focus:border-muted-900 ${
          isPassword ? 'pr-10' : 'pr-0'
        }`}
      />
      
      {isPassword && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-900 focus:outline-none"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  )
}

export default CustomInput