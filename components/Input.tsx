import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={twMerge(
        clsx(
          " bg-white px-4 py-1 shadow-md rounded-md placeholder:text-zinc-500 w-full ring-1 ring-secondary/60  h-10 outline-primary",
          className,
        ),
      )}
      {...props}
    />
  );
}
