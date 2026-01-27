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
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white">
          {step.number}
        </div>
        <p className="pt-2 text-lg leading-relaxed text-white">{step.text}</p>
      </div>
      {step.items && (
        <div className="ml-14 flex flex-col gap-2">
          {step.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-xl text-pink-400">✦</span>
              <span className="text-lg text-white">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className="h-15 sticky z-10 flex items-center bg-primary pt-2 shadow-xl">
        <Image src={logo} alt="logo" className="relative -left-5 h-16" />
      </header>

      <main className="row-start-2 flex flex-col items-center sm:items-start">
        <section className="z-100 z-10 flex h-80 w-full items-end justify-end bg-primary bg-hero-bg bg-cover bg-repeat px-2 py-0 text-lg text-white md:px-5 md:text-xl lg:h-fit lg:items-center lg:justify-between lg:px-0 lg:text-4xl xl:h-screen">
          <Image
            src={landingImages}
            alt="landing background"
            className="lg:img-fix z-0 -ml-11 hidden h-full w-full lg:block lg:w-1/2"
          />
          <Image
            src={line}
            alt="landing line image z-0"
            className="absolute left-0 z-0 h-auto lg:hidden"
          />
          <div className="z-10 flex w-full flex-col items-end gap-4 lg:gap-5">
            <span className="w-[80%] text-end font-bold leading-7 text-white md:mr-16 md:w-[60%] md:text-2xl lg:mr-20 lg:mt-20 lg:w-[76%] xl:mr-28 xl:text-4xl">
              Perdeu ou teve seu celular roubado? O{""}
              <span className="h-fit rounded-lg px-1.5 pt-1 leading-snug text-white">
                Procura.AÍ
              </span>{" "}
              pode te ajudar!
            </span>
            <span className="w-[65%] break-words text-right text-xs font-medium text-white md:text-lg lg:mr-20 lg:w-[75%] lg:text-xl xl:mr-28 xl:w-[80%] xl:text-2xl">
              Cadastre seus dispositivos e, se algo acontecer, acione as
              autoridades de forma rápida e segura. Com ajuda da tecnologia,
              você aumenta as chances de recuperar seu aparelho e ainda
              contribui para combater o mercado ilegal. Proteja-se agora e fique
              um passo à frente
            </span>
            <Link
              href={"/login"}
              className="mb-4 flex self-end lg:mb-10 lg:mr-20 lg:self-end xl:mr-28 xl:mt-20"
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

        <section className="relative z-0 flex h-full w-full flex-col items-center gap-6 px-4 py-5 lg:h-fit lg:gap-10 lg:py-2">
          <Image
            src={shapesLeft}
            alt="formas esquerda"
            className="absolute left-0 top-0 z-0 hidden md:block"
          />
          {/* <Image
            src={line}
            alt="formas direita"
            className="absolute hidden lg:block -bottom-20 right-0 z-0"
          /> */}

          <Image
            src={shapesRight}
            alt="gradiente direito"
            className="absolute -bottom-11 right-0 z-[-1] hidden w-full md:block"
          />

          <div className="z-10 mt-5 flex w-full flex-col gap-0">
            <h1 className="self-center text-xl font-medium text-primary md:text-4xl">
              Veja como é fácil se proteger
            </h1>
            <Image src={starsLine} alt="feat1" className="-mt-1 self-center" />
          </div>

          <div className="z-10 flex flex-col items-center justify-center gap-4 md:flex-row md:flex-wrap">
            <div className="flex flex-col gap-2">
              <span className="flex gap-1 text-lg font-bold text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  1
                </span>
                Crie uma conta
              </span>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#B6D7FC] px-2 py-4 drop-shadow-lg mobile-sm:w-72 mobile:w-80">
                <Image src={feat1} alt="feat1" className="h-24 self-center" />
                <span className="font-medium">
                  Cadastre-se no Procura.Aí informando alguns dados básicos
                </span>
              </div>
              {/* <div className="bg-gradient-to-r from-[#F466F3] via-[#8170F4] to-[#0D79F4] w-72 mobile:w-80 mobile-lg:w-[300px] py-1 px-1 rounded-xl">
              </div> */}
            </div>

            <div className="flex flex-col gap-2">
              <span className="flex gap-1 text-lg font-bold text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  2
                </span>
                Cadastre seus dispositivos
              </span>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#C5F4F3] px-2 py-4 drop-shadow-lg mobile-sm:w-72 mobile:w-80">
                <Image src={feat2} alt="feat2" className="h-24 self-center" />
                <span className="font-medium">
                  Registre um ou mais celulares para mantê-los protegidos
                </span>
              </div>
              {/* <div className="bg-gradient-to-r from-[#F466F3] via-[#8170F4] to-[#0D79F4] w-72 mobile:w-80 mobile-lg:w-[300px] py-1 px-1 rounded-xl flex gap-2">
              </div> */}
            </div>

            <div className="flex flex-col gap-2">
              <span className="flex gap-1 text-lg font-bold text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  3
                </span>
                Crie um alerta
              </span>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#F2CDC6] px-2 py-4 drop-shadow-lg mobile-sm:w-72 mobile:w-80">
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
              <span className="flex gap-1 text-lg font-bold text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                  4
                </span>
                Autoridades são acionadas
              </span>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-[#f5df164d] px-2 py-4 drop-shadow-lg mobile-sm:w-72 mobile:w-80">
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

          <div className="z-10 flex flex-col items-center gap-10">
            <Link href={"/cadastro"}>
              <Button
                variant="blue"
                className="self-center px-4 py-2 md:px-9 md:py-4 lg:text-xl"
              >
                Cadastre-se
              </Button>
            </Link>
            <span className="flex flex-col items-center text-lg font-bold text-procura-ai-black md:text-2xl lg:mb-10 3xl:mb-20">
              Disponível em breve nas principais lojas de aplicativos
              <Link href={process.env.NEXT_PUBLIC_APK_DOWNLOAD_LINK!}>
                <button
                  type="button"
                  className="rounded-lg bg-none px-4 pb-1.5 pt-2 text-white"
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
            "z-[1] flex h-fit w-full flex-col justify-between bg-faq bg-cover pt-24 lg:bg-faq",
            "lg:pt-10",
            // 'lg:pt-28 lg:pb-0 sm:pb-0 relative lg:-top-16 3xl:-top-24',
            // '-mt-14'
          )}
        >
          <div className="mb-16 flex flex-col items-center gap-6 px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight text-white lg:text-4xl">
              Perguntas frequentes
            </h2>
          </div>

          <div className="flex w-full flex-col gap-2 px-4 lg:px-32">
            {questions.map((question: Question, index: number) => (
              <Accordion key={index} type="single" collapsible>
                <AccordionItem
                  className="rounded-none border-0 border-b border-slate-600/30"
                  value={`item-${index}`}
                >
                  <AccordionTrigger
                    className={cn(
                      "px-0 py-6 text-base font-normal text-white lg:text-lg",
                      "transition-colors duration-200 hover:text-gray-300 hover:no-underline",
                      "[&>svg]:h-6 [&>svg]:w-6 [&>svg]:text-white",
                      "border-0 bg-transparent",
                    )}
                  >
                    <span className="w-full text-left">
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
              "relative z-[20] flex h-20 w-full items-center justify-start bg-white md:mt-0 lg:mt-4",
            )}
          >
            <Image
              src={govFull}
              alt="logo"
              className="z-10 h-12 w-64 md:w-96"
            />
            <Image
              src={lineFooter}
              alt="logo"
              className="absolute right-0 z-0 hidden h-full self-end sm:block md:w-[50%] lg:w-[80%] xl:w-[90%]"
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
