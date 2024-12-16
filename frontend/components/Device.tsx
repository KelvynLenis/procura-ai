import Button from "./Button";

export function Device() {

  return (
    <>
      <div className="flex bg-zinc-100 rounded-3xl px-3 py-3 justify-between max-w-[700px]">
        <div className="flex flex-col gap-1.5 w-1/2 text-lg">
          <span>Modelo: <span className="font-semibold">Galaxy A55</span></span>
          <span>Marca:  <span className="font-semibold">Samsung</span></span>
          <span>IMEI:  <span className="font-semibold">2469875</span></span>
          <span>Status:  <span className="font-semibold">ativo</span></span>
        </div>

        <div className="flex flex-col justify-between w-1/2">
          <button className="self-end font-medium">Editar</button>
          <Button variant="orange" className="self-end w-full py-1 max-w-52">Marcar como roubado</Button>
        </div>
      </div>
    </>
  )
}