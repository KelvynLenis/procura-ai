import { twMerge } from "tailwind-merge"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export function Input({ className, ...props }: InputProps) {

  return (
    <input className={twMerge("rounded-full bg-white px-4 py-1 shadow placeholder:text-zinc-500 w-full ring-1 ring-secondary h-10 outline-primary", className)} {...props} />
  )
}