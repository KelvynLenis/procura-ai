import { cn } from '@/lib/utils'
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant: 'orange' | 'blue' | 'white'
  className?: string
}

export default function Button({ children, variant, className, ...props }: ButtonProps) {
  return (
    <button className={cn(
      "rounded-full text-center items-center justify-center flex w-fit px-2 py-2 shadow transition-all duration-300",
      variant === 'orange' && "bg-primary text-white hover:bg-white hover:text-primary hover:ring-1 hover:ring-primary",
      variant === 'blue' && "bg-secondary text-white hover:bg-white hover:text-secondary hover:ring-1 hover:ring-secondary",
      variant === 'white' && "bg-white border-[0.5px] border-primary text-primary hover:bg-primary hover:text-white",
      className
    )}>
      {children}
    </button>
  )
}
