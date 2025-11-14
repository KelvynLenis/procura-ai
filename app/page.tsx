import Link from "next/link";
import Image from "next/image";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Button from "@/components/Button";

import { cn } from "@/lib/utils";
import { questions } from "@/utils/FAQ";
import { Question, QuestionStep } from "@/types";

import govFull from "../assets/icons/gov.png";
import starsLine from "../assets/images/circles-line.png";
import shapesLeft from "../assets/images/shapes-left.svg";
import shapesRight from "../assets/images/shapes-right.svg";
import googlePlay from "../assets/images/google-play.svg";
import feat1 from "../assets/icons/feat1.svg";
import feat2 from "../assets/icons/feat2.svg";
import feat3 from "../assets/icons/feat3.svg";
import feat4 from "../assets/icons/feat4.svg";
import logo from "../assets/icons/logo-text.svg";
import landingImages from "../assets/images/landing-image.png";
import line from "../assets/images/line01.svg";
import lineFooter from "../assets/images/line02.svg";

export default function Landing() {
  const renderStepContent = (step: QuestionStep) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {step.number}
        </div>
        <p className="text-white text-lg leading-relaxed pt-2">{step.text}</p>
      </div>
      {step.items && (
        <div className="ml-14 flex flex-col gap-2">
          {step.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-pink-400 text-xl">✦</span>
              <span className="text-white text-lg">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="shadow-xl flex items-center h-15 pt-2 z-10 sticky bg-primary">
        <Image src={logo} alt="logo" className="h-16 -left-5 relative" />
      </header>

      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <section className="z-100 bg-primary w-full h-80 lg:h-fit xl:h-screen bg-hero-bg bg-repeat bg-cover items-end justify-end flex lg:items-center lg:justify-between text-lg md:text-xl lg:text-4xl text-white px-2 md:px-5 lg:px-0 py-0 z-10">
          <Image
            src={landingImages}
            alt="landing background"
            className="w-full hidden lg:w-1/2 lg:block h-full z-0 -ml-11"
          />
          <Image
            src={line}
            alt="landing line image z-0"
            className="lg:hidden absolute h-auto left-0 z-0"
          />
          <div className="flex flex-col items-end gap-4 lg:gap-5 w-full z-10">
            <span className="font-bold w-[80%] lg:w-[76%] text-end md:text-2xl md:mr-16 md:w-[60%] lg:mr-20 lg:mt-20 xl:mr-28 xl:text-4xl text-white leading-7">
              Perdeu ou teve seu celular roubado? O{""}
              <span className="text-white rounded-lg px-1.5 pt-1 h-fit leading-snug">
                Procura.AÍ
              </span>{" "}
              pode te ajudar!
            </span>
            <span className="font-medium text-xs md:text-lg lg:text-xl xl:text-2xl lg:mr-20 xl:mr-28 break-words w-[65%] lg:w-[75%] xl:w-[80%] text-white text-right">
              Cadastre seus dispositivos e, se algo acontecer, acione as
              autoridades de forma rápida e segura. Com ajuda da tecnologia,
              você aumenta as chances de recuperar seu aparelho e ainda
              contribui para combater o mercado ilegal. Proteja-se agora e fique
              um passo à frente
            </span>
            <Link
              href={"/login"}
              className="self-end flex lg:self-end mb-4 lg:mb-10 lg:mr-20 xl:mr-28 xl:mt-20"
            >
              <Button
                variant="blue"
                className="px-4 py-2 md:px-9 md:py-4 lg:text-xl"
              >
                Entrar
              </Button>
            </Link>
          </div>
        </section>

        <section className="w-full h-full lg:h-fit gap-6 lg:gap-10 relative flex flex-col items-center px-4 z-0 py-5 lg:py-2">
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
            className="absolute hidden md:block -bottom-11 w-full right-0 z-[-1]"
          />

          <div className="flex flex-col w-full gap-0 z-10 mt-5">
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
              <div className="bg-[#B6D7FC] flex items-center justify-center gap-2 rounded-xl px-2 py-4 mobile-sm:w-72 mobile:w-80 drop-shadow-lg">
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
              <div className="bg-[#C5F4F3] flex items-center justify-center gap-2 rounded-xl px-2 py-4 mobile-sm:w-72 mobile:w-80 drop-shadow-lg">
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
              <div className="bg-[#F2CDC6] flex items-center justify-center gap-2 rounded-xl px-2 py-4 mobile-sm:w-72 mobile:w-80 drop-shadow-lg">
                <Image src={feat3} alt="feat3" className="h-24 self-center" />
                <span className="font-medium">
                  Em caso de roubo, perda ou furto de algum dispositivo, crie um
                  alerta{" "}
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
              <div className="bg-[#f5df164d] flex items-center justify-center gap-2 rounded-xl px-2 py-4 mobile-sm:w-72 mobile:w-80 drop-shadow-lg">
                <Image src={feat4} alt="feat4" className="h-24 self-center" />
                <span className="font-medium">
                  Agora seu celular tem mais chances de ser recuperado pelas
                  autoridades{" "}
                </span>
              </div>
              {/* <div className="bg-gradient-to-r from-[#F466F3] via-[#8170F4] to-[#0D79F4] w-72 mobile:w-80 mobile-lg:w-[300px] py-1 px-1 rounded-xl flex gap-2">
              </div> */}
            </div>
          </div>

          <div className="flex flex-col items-center gap-10 z-10">
            <Link href={"/cadastro"}>
              <Button
                variant="blue"
                className="self-center px-4 py-2 md:px-9 md:py-4 lg:text-xl"
              >
                Cadastre-se
              </Button>
            </Link>
            <span className="text-lg md:text-2xl font-bold flex flex-col items-center text-procura-ai-black lg:mb-10 3xl:mb-20">
              Disponível em breve nas principais lojas de aplicativos
              <Link href={process.env.NEXT_PUBLIC_APK_DOWNLOAD_LINK!}>
                <button
                  type="button"
                  className="rounded-lg px-4 pt-2 pb-1.5 text-white bg-none"
                >
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

        <section
          className={cn(
            "w-full h-fit bg-faq bg-cover lg:bg-faq flex flex-col justify-between z-[1] pt-24",
            "lg:pt-10",
            // 'lg:pt-28 lg:pb-0 sm:pb-0 relative lg:-top-16 3xl:-top-24',
            // '-mt-14'
          )}
        >
          <div className="flex flex-col items-center gap-6 mb-16 px-4">
            <h2 className="font-bold text-3xl lg:text-4xl text-center text-white tracking-tight">
              Perguntas frequentes
            </h2>
          </div>

          <div className="flex flex-col gap-2 w-full px-4 lg:px-32">
            {questions.map((question: Question, index: number) => (
              <Accordion key={index} type="single" collapsible>
                <AccordionItem
                  className="border-0 border-b border-slate-600/30 rounded-none"
                  value={`item-${index}`}
                >
                  <AccordionTrigger
                    className={cn(
                      "font-normal text-base lg:text-lg px-0 py-6 text-white",
                      "hover:no-underline hover:text-gray-300 transition-colors duration-200",
                      "[&>svg]:text-white [&>svg]:h-6 [&>svg]:w-6",
                      "border-0 bg-transparent",
                    )}
                  >
                    <span className="text-left w-full">
                      {question.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-0 pb-8 pt-4">
                    <div className="space-y-6 pt-4">
                      {question.answer.steps.map((step, stepIndex: number) => (
                        <div
                          key={stepIndex}
                          className="transform transition-all duration-200"
                        >
                          {renderStepContent(step)}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>

          <div className="mt-16 lg:mt-24"></div>

          <footer
            className={cn(
              "w-full relative h-20 md:mt-0 lg:mt-4 flex items-center justify-start z-[20] bg-white",
            )}
          >
            <Image
              src={govFull}
              alt="logo"
              className="w-64 h-12 md:w-96 z-10"
            />
            <Image
              src={lineFooter}
              alt="logo"
              className="h-full absolute right-0 self-end hidden sm:block md:w-[50%] lg:w-[80%] xl:w-[90%] z-0"
            />
          </footer>

          {/* <footer className={cn("w-full relative -bottom-20 md:mt-0 lg:mt-4 flex items-center justify-start z-[20] bg-primary py-4")}>
            <div className={cn('w-full items-center pl-9 justify-center hidden lg:flex md:justify-start py-0 px-8 h-14 md:h-fit')}>
              <Image src={secties} alt="logo" className='w-28 md:w-auto md:h-12' />
              <Image src={gov} alt="logo" className='w-28 md:w-auto md:h-12' />            
            </div>
          </footer> */}
        </section>
      </main>
    </>
  );
}
