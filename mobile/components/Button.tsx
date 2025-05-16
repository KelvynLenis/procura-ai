import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { ButtonProps } from '@/interfaces/button'
import { cn } from '@/utils/cn'

const Button = ({ children, className, variant, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={{ paddingVertical: 10 }}
      className={cn(
        'flex items-center justify-center px-6 rounded-full font-semibold',
        variant === 'blue' && 'bg-primary',
        variant === 'white' && 'bg-white border border-primary',
        variant === 'red' && 'bg-red-500',
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          'text-base',
          variant === 'blue' && 'text-white',
          variant === 'white' && 'text-black',
          variant === 'red' && 'text-white'
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  )
}

export default Button
