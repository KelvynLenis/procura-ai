import Button from "@/components/Button";
import { MyDevices } from "@/components/MyDevices";
import { TrustfullContacts } from "@/components/TrustfullContacts";


export default async function Home() {

  return (
    <div className="flex flex-col w-full h-screen gap-10 my-10 mr-5 px-2">
      <MyDevices />

      <div className="flex gap-5">
        <TrustfullContacts />

        <div className="flex flex-col w-1/3 h-52 rounded-xl shadow">
          <span className="w-full shadow-lg rounded-t-xl p-2 text-procura-ai-blue font-bold">Alertar autoridades</span>

          <div className="flex flex-col h-full p-3 justify-between">
            <span>Nenhum alerta acionado</span>
            <Button variant="blue" className="self-end">Criar alerta</Button>
          </div>
        </div>

        <div className="w-1/3 h-52 flex flex-col rounded-xl shadow">
          <span className="w-full shadow-lg rounded-t-xl p-2 text-procura-ai-blue font-bold">Boletim de ocorrência</span>

          <div className="flex flex-col h-[100%] p-3 justify-between">
            <span>Nenhum boletim registrado</span>
            <Button variant="blue" className="self-end">Registrar boletim</Button>
          </div>
        </div>
      </div>
    </div>
  )
}