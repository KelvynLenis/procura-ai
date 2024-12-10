import Image from "next/image";
import shapesLeft from '../assets/images/shapes-left.svg'
import shapesRight from '../assets/images/shapes-right.svg'
import googlePlay from '../assets/images/google-play.svg'
import appStore from '../assets/images/app-store.svg'
import arrow from '../assets/icons/arrow.svg'
import block from '../assets/icons/block.svg'
import notify from '../assets/icons/notify.svg'
import location from '../assets/icons/location.svg'
import dollar from '../assets/icons/dollar.svg'

export function Features() {

  return (
    <section className="w-full h-screen relative flex flex-col items-center justify-center px-4">
      {/* <Image src={shapesLeft} alt="formas esquerda" className="absolute -top-14 left-0 z-0" /> */}
      <Image src={shapesRight} alt="formas direita" className="absolute -bottom-1/4 right-0 z-0" />

      <div className="flex md:flex-row flex-col lg:gap-10 z-10 gap-5 md:px-10">
        <div className="md:flex justify-center items-center hidden">
          <div className="flex flex-col lg:w-[390px]">
            <Image src={arrow} alt="arrow" className="rotate-90 md:rotate-0" />
            <span className="lg:text-4xl text-2xl font-medium">Veja a que é possível fazer através do Procura.Aí</span>
          </div>
        </div>

        <div className="w-full lg:w-[500px] xl:h-[400px] bg-primary/5 border border-primary rounded-xl mb-10 lg:mb-20">
          <ul className="font-medium text-lg flex flex-col items-center h-full pt-5">
            <li className="flex items-center w-full">
              <Image src={block} alt="celular cortado" height={90} />
              <span>Bloqueio remoto do aparelho</span>
            </li>
            <li className="flex items-center w-full">
              <Image src={notify} alt="celular notificando" height={90} />
              <span>Notificação de alerta</span>
            </li>
            <li className="flex items-center w-full">
              <Image src={location} alt="alfinete de mapa" height={90} />
              <span>Rastreio do aparelho</span>
            </li>
            <li className="flex items-center w-full">
              <Image src={dollar} alt="simbolo de dollar" height={90} />
              <span>Bloqueio de aplicativos bancários</span>
            </li>
          </ul>
        </div>
      </div>

      <span className="font-bold mb-4 text-lg z-10">Baixe nas principais lojas de aplicativos</span>
      <div className="flex z-10">
        <button>
          <Image src={googlePlay} alt="disponível no google play" />
        </button>
        <button>
          <Image src={appStore} alt="disponível na app store" />
        </button>
      </div>

    </section>
  )
}