import Button from "./Button";
import { Device as DeviceProps } from "@/utils/types";


export function Device({ phoneModel, brand, imei, latitude, longitude }: DeviceProps) {

  return (
    <>
      <div className="flex bg-zinc-100 rounded-3xl px-3 py-3 justify-between max-w-[700px]">
        <div className="flex flex-col gap-1.5 w-1/2 text-lg">
          <span>Modelo: <span className="font-semibold">{phoneModel}</span></span>
          <span>Marca:  <span className="font-semibold">{brand}</span></span>
          <span>IMEI:  <span className="font-semibold">{imei}</span></span>
          <span>Status:  <span className="font-semibold">ativo</span></span>
        </div>

        <div className="flex flex-col justify-between w-1/2">
          <button className="self-end font-medium hover:opacity-50">Editar</button>
          <Button variant="orange" className="self-end w-full py-1 max-w-52">Marcar como roubado</Button>
        </div>
      </div>
    </>
  )
}