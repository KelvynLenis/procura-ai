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
    <section className="w-full h-screen relative flex flex-col items-center justify-center px-4 z-0">
      <Image src={shapesLeft} alt="formas esquerda" className="absolute bottom-24 left-0 z-0" />
      <Image src={shapesRight} alt="formas direita" className="absolute top-80 -right-0" />

      <div className="flex md:flex-row flex-col lg:gap-10 z-10 gap-5 md:px-10">
        <div className="md:flex justify-center items-center hidden">
          <div className="flex flex-col lg:w-[390px]">
            <Image src={arrow} alt="arrow" className="rotate-90 md:rotate-0" />
            <span className="lg:text-4xl text-2xl font-medium">Com o Procura.Aí você pode</span>
          </div>
        </div>

        <div className="w-full bg-primary/5 border border-primary bg-white rounded-xl mb-10 lg:mb-20 p-6">
          <ul className="font-medium text-lg flex flex-col items-center h-full gap-6">
            <li className="flex items-center w-full">
              <Image src={block} alt="celular cortado" height={70} />
              <span>Fazer o bloqueio remoto do dispositivo</span>
            </li>
            <li className="flex items-center w-full">
              <Image src={notify} alt="celular notificando" height={70} />
              <span>Notificar as autoridades</span>
            </li>
            <li className="flex items-center w-full">
              <Image src={location} alt="alfinete de mapa" height={70} />
              <span>Rastrear a localização do dispositivo</span>
            </li>
          </ul>
        </div>
      </div>

      {/* <span className="font-bold mb-4 text-lg z-10">Baixe nas principais lojas de aplicativos</span>
      <div className="flex z-10">
        <button>
          <Image src={googlePlay} alt="disponível no google play" />
        </button>
        <button>
          <Image src={appStore} alt="disponível na app store" />
        </button>
      </div> */}

    </section>
  )
}