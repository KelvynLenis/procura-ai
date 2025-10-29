import { cn } from "@/lib/utils";
import ClipLoader from "react-spinners/ClipLoader";

interface LoadingToastProps {
  isReactToastifyComponent?: boolean;
}

export function LoadingToast({ isReactToastifyComponent }: LoadingToastProps) {
  return (
    <>
      <div
        className={cn(
          "flex w-fit items-end justify-end gap-5 rounded-xl bg-white text-zinc-700 opacity-70",
          isReactToastifyComponent
            ? "py-4"
            : "absolute left-1/3 top-4 translate-x-1/2 px-5 py-5 shadow",
        )}
      >
        Carregando requisição, aguarde.
        <ClipLoader color="#0F2498" size={25} />
      </div>
    </>
  );
}
