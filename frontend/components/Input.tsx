import { twMerge } from "tailwind-merge"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function Input({ className, ...props }: InputProps) {

  return (
    <input className={twMerge("rounded-md px-2 py-1 placeholder:text-zinc-500 w-72", className)} {...props} />
  )
}