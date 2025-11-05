import clsx from "clsx";
import { twMerge } from "tailwind-merge";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={twMerge(
        clsx(
          "h-10 w-full rounded-md bg-white px-4 py-1 shadow-md outline-primary ring-1 ring-secondary/60 placeholder:text-zinc-500",
          className,
        ),
      )}
      {...props}
    />
  );
}
