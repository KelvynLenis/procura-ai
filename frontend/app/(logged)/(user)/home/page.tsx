import Button from "@/components/Button";
import { Footer } from "@/components/Footer";
import { YourDevices } from "@/components/YourDevices";
import { TrustfullContacts } from "@/components/TrustfullContacts";


export default async function Home() {

  return (
    <div className="flex flex-col w-full h-fit gap-10 mt-5 mr-2 mb-10 pb-10 px-2 md:pl-5 xl:pl-0 md:overflow-y-visible">
      <YourDevices />

      <div className="flex flex-col gap-5 lg:flex-row">
        <TrustfullContacts />

        <div className="flex bg-white flex-col w-full lg:w-1/3 h-52 rounded-xl shadow text-zinc-500">
          <span className="w-full shadow-lg rounded-t-xl p-2 text-zinc-500 font-bold">Alertar autoridades</span>

          <div className="flex flex-col h-full p-3 justify-between">
            <span>Em breve</span>
            <Button disabled variant="blue" className="self-end">Criar alerta</Button>
          </div>
        </div>

        <div className="w-full bg-white lg:w-1/3 h-52 flex flex-col rounded-xl shadow text-zinc-500">
          <span className="w-full shadow-lg rounded-t-xl p-2 text-zinc-500 font-bold">Boletim de ocorrência</span>

          <div className="flex flex-col h-[100%] p-3 justify-between">
            <span>Em breve</span>
            <Button disabled variant="blue" className="self-end">Registrar boletim</Button>
          </div>
        </div>
      </div>

      {/* <Footer /> */}
    </div>
  )
}