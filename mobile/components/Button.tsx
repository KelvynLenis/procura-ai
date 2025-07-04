import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { ButtonProps } from '@/interfaces/button'
import { cn } from '@/utils/cn'

const Button = ({ children, className, variant, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={{ paddingVertical: 10 }}
      className={cn(
        'flex flex-row items-center justify-center px-6 rounded-full font-semibold w-fit',
        variant === 'blue' && 'bg-secondary',
        variant === 'white' && 'bg-white border border-red-500',
        variant === 'red' && 'bg-red-500',
        variant === 'green' && 'bg-green-500 w-fit rounded-md',
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          'text-base',
          variant === 'blue' && 'text-white',
          variant === 'white' && 'text-red-500',
          variant === 'red' && 'text-white'
        )}
      >
        {children}
      </Text>
    </TouchableOpacity>
  )
}

export default Button
