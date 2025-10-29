"use client";

import { CircleHelp, Triangle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { useState } from "react";

export function OccurrenceTypeDescription() {
  const [isHintOpen, setIsHintOpen] = useState(false);

  return (
    <>
      {/* versão mobile */}

      <div className="relative flex w-full gap-2 md:hidden">
        <div className="flex items-center">
          <span className="flex h-6 align-text-bottom text-red-500">*</span>
          Tipo de ocorrência
        </div>
        <button type="button" className="group text-xs md:hidden">
          <CircleHelp
            size={22}
            className="fill-secondary text-white"
            onClick={() => setIsHintOpen(!isHintOpen)}
          />
        </button>
      </div>

      {isHintOpen && (
        <div className="z-[100] flex w-full flex-col gap-2 rounded-md bg-[#C4F3F2] p-2 text-justify font-normal leading-5">
          <Triangle className="-left-4 top-[45%] z-[100] hidden -rotate-90 fill-[#F3E5B7] text-[#F3E5B7] md:absolute md:-left-[1rem] md:top-[16.5rem] md:flex" />
          <p>
            Entenda a diferença entre{" "}
            <span className="font-semibold">os tipos de ocorrência</span>
          </p>
          <p>
            O <span className="font-semibold">furto</span> ocorre quando há a
            subtração de coisas alheias móveis, sem o consentimento do
            proprietário, com o intuito de ficar com elas para si, porém{" "}
            <span className="font-semibold underline">
              sem violência ou grave ameaça
            </span>
            .
            <br /> Exemplo: subtrair um telefone celular de uma bolsa enquanto a
            dona não estava vendo
          </p>
          <p>
            Já o <span className="font-semibold">roubo</span> ocorre com a
            subtração de coisas alheias móveis{" "}
            <span className="font-semibold underline">
              com a utilização de violência ou grave ameaça contra a pessoa
            </span>
            .
            <br /> Exemplo: um indivíduo com a intenção de subtrair um telefone
            celular, aponta uma arma de fogo contra a vítima e ameaça atirar
            contra ela caso o aparelho não seja entregue.
          </p>
          <p>
            Entretanto,{" "}
            <span className="font-semibold">o extravio ou perda</span> é
            caracterizado pelo{" "}
            <span className="font-semibold underline">
              desaparecimento ou sumiço de algo
            </span>
            .{" "}
          </p>
        </div>
      )}

      {/* versão desktop */}

      <div className="relative hidden w-full md:flex">
        <div className="flex items-center">
          <span className="flex h-6 align-text-bottom text-red-500">*</span>
          Tipo de ocorrência
        </div>
        <Popover>
          <PopoverTrigger className="hidden md:block">
            <CircleHelp size={22} className="fill-secondary text-white" />
          </PopoverTrigger>
          <PopoverContent className="relative border-none bg-transparent shadow-none">
            <div className="absolute left-[10.5rem] z-[100] flex w-full flex-col gap-2 rounded-md bg-[#C4F3F2] p-2 text-justify font-normal leading-5 md:-top-[24rem]">
              <Triangle className="-left-4 top-[45%] z-[100] hidden -rotate-90 fill-[#F3E5B7] text-[#F3E5B7] md:absolute md:-left-[1rem] md:top-[22.2rem] md:flex" />
              <p>
                Entenda a diferença entre{" "}
                <span className="font-semibold">os tipos de ocorrência</span>
              </p>
              <p>
                O <span className="font-semibold">furto</span> ocorre quando há
                a subtração de coisas alheias móveis, sem o consentimento do
                proprietário, com o intuito de ficar com elas para si, porém{" "}
                <span className="font-semibold underline">
                  sem violência ou grave ameaça
                </span>
                .
                <br /> Exemplo: subtrair um telefone celular de uma bolsa
                enquanto a dona não estava vendo
              </p>
              <p>
                Já o <span className="font-semibold">roubo</span> ocorre com a
                subtração de coisas alheias móveis{" "}
                <span className="font-semibold underline">
                  com a utilização de violência ou grave ameaça contra a pessoa
                </span>
                .
                <br /> Exemplo: um indivíduo com a intenção de subtrair um
                telefone celular, aponta uma arma de fogo contra a vítima e
                ameaça atirar contra ela caso o aparelho não seja entregue.
              </p>
              <p>
                Entretanto,{" "}
                <span className="font-semibold">o extravio ou perda</span> é
                caracterizado pelo{" "}
                <span className="font-semibold underline">
                  desaparecimento ou sumiço de algo
                </span>
                .{" "}
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
