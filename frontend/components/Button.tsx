'use client'

import { cn } from '@/lib/utils'
import ClipLoader from 'react-spinners/ClipLoader';
import React, { useState } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant: 'orange' | 'blue' | 'white'
  isLoader?: boolean
  className?: string
}

export default function Button({ children, variant, isLoader, className, ...props }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <button className={cn(
      "rounded-full text-center items-center justify-center flex w-fit px-2 py-2 shadow transition-all duration-300",
      variant === 'orange' && "bg-primary text-white hover:bg-white hover:text-primary hover:ring-1 hover:ring-primary",
      variant === 'blue' && "bg-secondary text-white hover:bg-white hover:text-secondary hover:ring-1 hover:ring-secondary",
      variant === 'white' && "bg-white border-[0.5px] border-primary text-primary hover:bg-primary hover:text-white",
      className
    )}
      onClick={() => setIsLoading(true)}
      {...props}
    >
      {
        isLoader && isLoading
          ? (
            <div className='flex w-20 items-center justify-center'>
              <ClipLoader color='#FFF' size={25} />
            </div>
          )
          : children
      }
    </button>
  )
}
