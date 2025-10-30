"use client";

import { Check, Clipboard } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

interface CopyToClipBoardButtonProps {
  text: string;
}

export function CopyToClipBoardButton({ text }: CopyToClipBoardButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      toast("Copiado para a área de transferência!", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        style: {
          color: "#65A30D",
        },
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reseta o estado após 2 segundos
    } catch (err) {
      console.error("Erro ao copiar para a área de transferência: ", err);
    }
  };

  return (
    <>
      <button onClick={() => handleCopy(text)}>
        {copied ? (
          <Check size={16} className="text-lime-600" />
        ) : (
          <Clipboard size={16} />
        )}
      </button>
    </>
  );
}
