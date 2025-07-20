'use client'

import { CircleHelp, Triangle } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useState } from 'react'

export function OccurrenceTypeDescription() {
  const [isHintOpen, setIsHintOpen] = useState(false)

  return (
    <>
      <div className="flex justify-between w-full relative md:hidden">
        <div className="flex items-center">
          <span className="text-red-500 h-6 flex align-text-bottom">*</span>
          Tipo de ocorrência
        </div>
        <button type="button" className="text-xs group md:hidden">
          <CircleHelp 
            size={22}
            className="fill-procura-ai-blue text-white"
            onClick={() => setIsHintOpen(!isHintOpen)}
          />
        </button>
      </div>
      {isHintOpen && (
        <div className="flex w-full flex-col z-[100]  gap-2 bg-[#C4F3F2] font-normal p-2 rounded-md text-justify leading-5">
          <Triangle className="hidden md:flex md:absolute md:top-[16.5rem] md:-left-[1rem] z-[100] top-[45%] -rotate-90 -left-4 fill-[#F3E5B7] text-[#F3E5B7]" />
          <p>
            Entenda a diferença entre{' '}
            <span className="font-semibold">os tipos de ocorrência</span>
          </p>
          <p>
            O <span className="font-semibold">furto</span> ocorre quando há a
            subtração de coisas alheias móveis, sem o consentimento do
            proprietário, com o intuito de ficar com elas para si, porém{' '}
            <span className="font-semibold underline">
              sem violência ou grave ameaça
            </span>
            .
            <br /> Exemplo: subtrair um telefone celular de uma bolsa enquanto a
            dona não estava vendo
          </p>
          <p>
            Já o <span className="font-semibold">roubo</span> ocorre com a
            subtração de coisas alheias móveis{' '}
            <span className="font-semibold underline">
              com a utilização de violência ou grave ameaça contra a pessoa
            </span>
            .
            <br /> Exemplo: um indivíduo com a intenção de subtrair um telefone
            celular, aponta uma arma de fogo contra a vítima e ameaça atirar
            contra ela caso o aparelho não seja entregue.
          </p>
          <p>
            Entretanto,{' '}
            <span className="font-semibold">o extravio ou perda</span> é
            caracterizado pelo{' '}
            <span className="font-semibold underline">
              desaparecimento ou sumiço de algo
            </span>
            .{' '}
          </p>
        </div>
      )}
      <div className="justify-between w-full relative hidden md:flex">
        <div className="flex items-center">
          <span className="text-red-500 h-6 flex align-text-bottom">*</span>
          Tipo de ocorrência
        </div>
        <Popover>
          <PopoverTrigger className="hidden md:block">
            <CircleHelp size={22} className="fill-procura-ai-blue text-white" />
          </PopoverTrigger>
          <PopoverContent className="relative bg-transparent shadow-none border-none">
            <div className="flex w-full flex-col absolute z-[100] left-[10.5rem] md:-top-[24rem] bg-[#F3E5B7] gap-2 font-normal p-2 rounded-md text-justify leading-5">
              <Triangle className="hidden md:flex md:absolute md:top-[22.2rem] md:-left-[1rem] z-[100] top-[45%] -rotate-90 -left-4 fill-[#F3E5B7] text-[#F3E5B7]" />
              <p>
                Entenda a diferença entre{' '}
                <span className="font-semibold">os tipos de ocorrência</span>
              </p>
              <p>
                O <span className="font-semibold">furto</span> ocorre quando há
                a subtração de coisas alheias móveis, sem o consentimento do
                proprietário, com o intuito de ficar com elas para si, porém{' '}
                <span className="font-semibold underline">
                  sem violência ou grave ameaça
                </span>
                .
                <br /> Exemplo: subtrair um telefone celular de uma bolsa
                enquanto a dona não estava vendo
              </p>
              <p>
                Já o <span className="font-semibold">roubo</span> ocorre com a
                subtração de coisas alheias móveis{' '}
                <span className="font-semibold underline">
                  com a utilização de violência ou grave ameaça contra a pessoa
                </span>
                .
                <br /> Exemplo: um indivíduo com a intenção de subtrair um
                telefone celular, aponta uma arma de fogo contra a vítima e
                ameaça atirar contra ela caso o aparelho não seja entregue.
              </p>
              <p>
                Entretanto,{' '}
                <span className="font-semibold">o extravio ou perda</span> é
                caracterizado pelo{' '}
                <span className="font-semibold underline">
                  desaparecimento ou sumiço de algo
                </span>
                .{' '}
              </p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </>
  )
}
