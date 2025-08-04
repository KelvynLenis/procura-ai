import Image from 'next/image'
import starsLine from '../assets/images/circles-line.png'
import shapesLeft from '../assets/images/shapes-left.svg'
import shapesRight from '../assets/images/shapes-right.svg'
import googlePlay from '../assets/images/google-play.svg'
import feat1 from '../assets/icons/feat1.svg'
import feat2 from '../assets/icons/feat2.svg'
import feat3 from '../assets/icons/feat3.svg'
import feat4 from '../assets/icons/feat4.svg'
import Link from 'next/link'
import Button from './Button'
import { AiFillAndroid } from "react-icons/ai";


export function Features() {
  return (
    <section className="w-full h-full lg:h-fit gap-6 lg:gap-10 relative flex flex-col items-center px-4 z-0 py-10 lg:py-2">
      <Image
        src={shapesLeft}
        alt="formas esquerda"
        className="absolute hidden md:block top-0 left-0 z-0"
      />
      {/* <Image
        src={line}
        alt="formas direita"
        className="absolute hidden lg:block -bottom-20 right-0 z-0"
      /> */}

      <Image
        src={shapesRight}
        alt="gradiente direito"
        className="absolute hidden md:block -bottom-11 w-full right-0 z-0"
      />

      <div className="flex flex-col w-full gap-0 z-10 mt-14">
        <h1 className="text-xl md:text-4xl text-primary font-medium self-center">
          Veja como é fácil se proteger
        </h1>
        <Image src={starsLine} alt="feat1" className="self-center -mt-1" />
      </div>

      <div className="flex md:flex-wrap flex-col items-center justify-center md:flex-row gap-4 z-10">
        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary flex gap-1 text-lg">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
              1
            </span>
            Crie uma conta
          </span>
            <div className='bg-[#B6D7FC] flex items-center justify-center gap-2 rounded-xl px-2 py-4 w-80 drop-shadow-lg'>
              <Image src={feat1} alt="feat1" className="h-24 self-center" />
              <span className="font-medium">
                Cadastre-se no Procura.Aí informando alguns dados básicos
              </span>
            </div>
          {/* <div className="bg-gradient-to-r from-[#F466F3] via-[#8170F4] to-[#0D79F4] w-72 mobile:w-80 mobile-lg:w-[300px] py-1 px-1 rounded-xl">
          </div> */}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary flex gap-1 text-lg">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
              2
            </span>
            Cadastre seus dispositivos
          </span>
            <div className='bg-[#C5F4F3] flex items-center justify-center gap-2 rounded-xl px-2 py-4 w-80 drop-shadow-lg'>
              <Image src={feat2} alt="feat2" className="h-24 self-center" />
              <span className="font-medium">
                Registre um ou mais celulares para mantê-los protegidos
              </span>
            </div>
          {/* <div className="bg-gradient-to-r from-[#F466F3] via-[#8170F4] to-[#0D79F4] w-72 mobile:w-80 mobile-lg:w-[300px] py-1 px-1 rounded-xl flex gap-2">
          </div> */}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary flex gap-1 text-lg">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
              3
            </span>
            Crie um alerta
          </span>
            <div className='bg-[#F2CDC6] flex items-center justify-center gap-2 rounded-xl px-2 py-4 w-80 drop-shadow-lg'>
              <Image src={feat3} alt="feat3" className="h-24 self-center" />
              <span className="font-medium">
                Em caso de roubo, perda ou furto de algum dispositivo, crie um
                alerta{' '}
              </span>
            </div>
          {/* <div className="bg-gradient-to-r from-[#F466F3] via-[#8170F4] to-[#0D79F4] w-72 mobile:w-80 mobile-lg:w-[300px] py-1 px-1 rounded-xl flex gap-2">
          </div> */}
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-bold text-primary flex gap-1 text-lg">
            <span className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
              4
            </span>
            Autoridades são acionadas
          </span>
            <div className='bg-[#f5df164d] flex items-center justify-center gap-2 rounded-xl px-2 py-4 w-80 drop-shadow-lg'>
              <Image src={feat4} alt="feat4" className="h-24 self-center" />
              <span className="font-medium">
                Agora seu celular tem mais chances de ser recuperado pelas
                autoridades{' '}
              </span>
            </div>
          {/* <div className="bg-gradient-to-r from-[#F466F3] via-[#8170F4] to-[#0D79F4] w-72 mobile:w-80 mobile-lg:w-[300px] py-1 px-1 rounded-xl flex gap-2">
          </div> */}
        </div>
      </div>

      <div className="flex flex-col items-center gap-10 z-10">
        <Link href={'/cadastro'}>
          <Button
            variant="blue"
            className="self-center px-4 py-2 md:px-9 md:py-4 text-xl"
          >
            Cadastre-se
          </Button>
        </Link>
        <span className="text-lg md:text-2xl font-bold flex flex-col items-center text-procura-ai-black 3xl:mb-20">
          Disponível em breve nas principais lojas de aplicativos
          <Link href={process.env.NEXT_PUBLIC_APK_DOWNLOAD_LINK!}>
            <button type='button' className='rounded-lg px-4 pt-2 pb-1.5 text-white bg-none'>
              <Image src={googlePlay} alt="disponível no google play" />
            </button>
          </Link> 
        </span>
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
