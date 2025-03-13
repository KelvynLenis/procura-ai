import Image from 'next/image'
import circlesLine from '../assets/images/circles-line.png'
import shapesLeft from '../assets/images/shapes-left.svg'
import shapesRight from '../assets/images/shapes-right.svg'
import feat1 from '../assets/icons/feat1.svg'
import feat2 from '../assets/icons/feat2.svg'
import feat3 from '../assets/icons/feat3.svg'
import feat4 from '../assets/icons/feat4.svg'
import Link from 'next/link'
import Button from './Button'

export function Features() {
  return (
    <section className="w-full h-full lg:h-[700px] gap-20 relative flex flex-col items-center px-4 z-0 py-32">
      <Image
        src={shapesLeft}
        alt="formas esquerda"
        className="absolute hidden md:block md:top-[900px] lg:top-96 2xl:top-[420px] left-0 z-0"
      />
      <Image
        src={shapesRight}
        alt="formas direita"
        className="absolute hidden md:block top-96 md:top-[700px] lg:top-[200px] right-0"
      />

      <div className="flex flex-col w-full gap-2">
        <h1 className="text-4xl text-primary font-medium self-center">
          Veja como é fácil se proteger
        </h1>
        <Image src={circlesLine} alt="feat1" className="self-center" />
      </div>

      <div className="flex lg:flex-wrap flex-col lg:flex-row gap-4">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary flex gap-1 text-lg">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
              1
            </span>
            Crie uma conta
          </span>
          <div className="bg-[#7F96B8] w-72 py-6 px-3 rounded-xl flex gap-2">
            <Image src={feat1} alt="feat1" className="h-24 self-center" />
            <span className="font-medium">
              Cadastre-se no Procura.Aí informando alguns dados básicos
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary flex gap-1 text-lg">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
              2
            </span>
            Cadastre seus dispositivos
          </span>
          <div className="bg-procura-ai-yellow/50 w-72 py-6 px-3 rounded-xl flex gap-2">
            <Image src={feat2} alt="feat2" className="h-24 self-center" />
            <span className="font-medium">
              Registre um ou mais celulares para mantê-los protegidos
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary flex gap-1 text-lg">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
              3
            </span>
            Crie um alerta
          </span>
          <div className="bg-[#D04228]/50 w-72 py-6 px-3 rounded-xl flex gap-2">
            <Image src={feat3} alt="feat3" className="h-24 self-center" />
            <span className="font-medium">
              Em caso de roubo, perda ou furto de algum dispositivo, crie um
              alerta{' '}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary flex gap-1 text-lg">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
              4
            </span>
            Autoridades são acionadas
          </span>
          <div className="bg-[#39AF84]/50 w-72 py-6 px-3 rounded-xl flex gap-2">
            <Image src={feat4} alt="feat4" className="h-24 self-center" />
            <span className="font-medium">
              Agora seu celular tem mais chances de ser recuperado pelas
              autoridades{' '}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-7">
        <Link href={'/cadastro'}>
          <Button variant="blue" className="self-center px-9 py-4 text-xl">
            Cadastre-se
          </Button>
        </Link>
        <span className="text-2xl font-bold text-procura-ai-black">
          Disponível em breve nas principais lojas de aplicativos
        </span>
      </div>

      {/* <div className="flex md:flex-row flex-col lg:gap-10 z-10 gap-5 md:px-10">
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
      </div> */}

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
