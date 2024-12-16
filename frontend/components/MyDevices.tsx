import Image from "next/image";
import { Device } from "./Device";
import DeviceBg from '../assets/images/devices-bg.png'
import Button from "./Button";

export function MyDevices() {

  return (
    <>
      <div className="h-full w-full flex flex-col gap-4">
        {
          false ? (
            <div className="flex flex-col w-full h-screen items-center justify-center">
              <span className="text-center">Você ainda não possui dispositivos cadastrados</span>

              <Button variant="white">
                Cadastrar dispositivo
              </Button>
            </div>
          ) : (
            <>
              <div className="h-fit w-full flex flex-col gap-4 px-4 pt-4 pb-8 relative">
                <Image src={DeviceBg} alt="dispositivos" className="w-screen left-0 top-0 h-full absolute z-0" />
                <div className="z-10 flex flex-col h-full gap-4">
                  <span className="font-semibold text-xl">Meus dispositivos</span>

                  <Device />
                  <Device />
                </div>
              </div>

              <span className="text-center font-medium">Outras ações</span>

              <div className="h-full w-fit px-4 grid grid-cols-4 gap-4 text-xs self-center font-medium">
                <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end ">Cadastrar ocorrencia</button>
                <button className="mx-auto pb-3 w-fit max-w-24 bg-zinc-200 rounded-lg flex items-end">Bloquear apps bancários</button>
                <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Alertar autoridades</button>
                <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Contatos de confiança</button>

                <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Cadastrar ocorrencia</button>
                <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Bloquear apps bancários</button>
                <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Alertar autoridades</button>
                <button className="mx-auto pb-3 md:px-2 w-fit max-w-24 h-20 bg-zinc-200 rounded-lg flex items-end">Contatos de confiança</button>
              </div>
            </>
          )
        }
      </div>
    </>
  )
}