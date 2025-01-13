import Button from "./Button";

export function TrustfullContacts() {

  return (
    <>
      <div className="flex flex-col  w-full lg:w-1/3 h-64 gap-3 rounded-xl bg-white shadow">
        <span className="w-full shadow-lg rounded-t-xl p-2 text-procura-ai-blue font-bold">Contatos de confiança</span>

        <div className="flex flex-col h-full p-3">
          <ul className="flex flex-col w-full h-full gap-3">
            <li>Mãe</li>
            <span className="w-full h-0.5 bg-procura-ai-black/40 rounded-full" />
            <li>Pai</li>
            <span className="w-full h-0.5 bg-procura-ai-black/40 rounded-full" />
            <li>Filho</li>
          </ul>
          <Button variant="blue" className="self-end">Adicionar contato</Button>
        </div>
      </div>
    </>
  )
}