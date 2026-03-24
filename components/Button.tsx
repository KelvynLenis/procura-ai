"use client";

import { cn } from "@/lib/utils";
import ClipLoader from "react-spinners/ClipLoader";
import type React from "react";
import { useState } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant: "orange" | "blue" | "white" | "red" | "black" | "empty" | "disabled";
  isLoader?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant,
  isLoader,
  className,
  ...props
}: ButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <button
      className={cn(
        "flex w-fit items-center justify-center rounded-full px-6 py-2 text-center text-sm font-semibold drop-shadow transition-all duration-300 disabled:bg-zinc-300 disabled:text-zinc-400 disabled:ring-0 lg:text-base",
        variant === "blue" &&
          "border-[0.5px] border-secondary bg-secondary text-white hover:bg-white hover:text-secondary",
        variant === "white" &&
          "border-[0.5px] border-red-500 bg-white text-red-500 hover:bg-red-500 hover:text-white",
        variant === "black" &&
          "border-[0.5px] border-black bg-white text-black hover:bg-black hover:text-white",
        variant === "red" &&
          "border-[0.5px] border-red-500 bg-red-500 text-white hover:bg-white hover:text-red-500",
        variant === "empty" &&
          "text-primary drop-shadow-none hover:text-primary/80",
        variant === "disabled" &&
          "w-fit bg-zinc-300 font-medium text-zinc-500 opacity-50",
        className,
      )}
      onClick={() => setIsLoading(true)}
      {...props}
    >
      {isLoader && isLoading ? (
        <div className="flex w-20 items-center justify-center">
          <ClipLoader color="#000" size={25} />
        </div>
      ) : (
        children
      )}
    </button>
  );
}
