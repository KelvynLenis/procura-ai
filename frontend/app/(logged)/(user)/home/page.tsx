import Button from "@/components/Button";
import { MyDevices } from "@/components/MyDevices";
import { TrustfullContacts } from "@/components/TrustfullContacts";


export default async function Home() {

  return (
    <div className="flex flex-col w-full h-screen gap-10 my-5 md:mb-20 pb-10 mr-5 px-2 overflow-y-scroll md:overflow-y-visible">
      <MyDevices />

      <div className="flex flex-col gap-5 lg:flex-row">
        <TrustfullContacts />

        <div className="flex flex-col w-full lg:w-1/3 h-52 rounded-xl shadow">
          <span className="w-full shadow-lg rounded-t-xl p-2 text-procura-ai-blue font-bold">Alertar autoridades</span>

          <div className="flex flex-col h-full p-3 justify-between">
            <span>Nenhum alerta acionado</span>
            <Button variant="blue" className="self-end">Criar alerta</Button>
          </div>
        </div>

        <div className="w-full lg:w-1/3 h-52 flex flex-col rounded-xl shadow">
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