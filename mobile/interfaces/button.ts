import { TouchableOpacityProps } from "react-native"

export interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode
  variant: 'white' | 'blue' | 'red' | 'green'
  className?: string
}