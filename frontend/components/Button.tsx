'use client'

import { cn } from '@/lib/utils'
import ClipLoader from 'react-spinners/ClipLoader';
import React, { useState } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant: 'orange' | 'blue' | 'white' | 'red'
  isLoader?: boolean
  className?: string
}

export default function Button({ children, variant, isLoader, className, ...props }: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <button className={cn(
      "rounded-full text-center items-center justify-center flex w-fit px-2 py-2 drop-shadow-lg transition-all duration-300 disabled:bg-zinc-300 disabled:text-zinc-400 disabled:ring-0",
      variant === 'blue' && "bg-procura-ai-blue text-white hover:bg-white hover:text-procura-ai-blue hover:ring-1 hover:ring-procura-ai-blue",
      variant === 'white' && "bg-white border-[0.5px] border-primary text-primary hover:bg-primary hover:text-white",
      variant === 'red' && "bg-red-500 border-[0.5px] border-red-500 text-white hover:bg-white hover:text-red-500",
      className
    )}
      onClick={() => setIsLoading(true)}
      {...props}
    >
      {
        isLoader && isLoading
          ? (
            <div className='flex w-20 items-center justify-center'>
              <ClipLoader color='#000' size={25} />
            </div>
          )
          : children
      }
    </button>
  )
}
