"use client";

import Image from "next/image";
import { LoginForm } from "@/components/Forms/LoginForm";
import { cn } from "@/lib/utils";
import { questions } from "@/utils/FAQ";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Question, QuestionStep } from "@/types";

import govFooterMobile from "../../../assets/icons/gov-footer-mobile.png";
import sicLogo from "../../../assets/icons/sic_logo.png";
import logo from "../../../assets/icons/logo-text.svg";
import footerLineLeft from "../../../assets/icons/footer-line-left.svg";
import footerLineRight from "../../../assets/icons/footer-line-right.svg";
import footerLogo from "../../../assets/icons/logo-dark.svg";
import govFull from "../../../assets/icons/gov.png";

import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

import Link from "next/link";
import MakeRequest from "./MakeRequest";

export default async function ConfirmOwnershipTransfer({
  params,
}: {
  params: Promise<{ imei: string }>;
}) {
  const { imei } = await params;

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
      <header className="h-15 sticky z-10 flex items-center bg-primary px-5 pt-2 shadow-lg">
        <Image src={logo} alt="logo" className="relative -left-8 h-16" />
      </header>
      <main className="row-start-2 flex h-full min-h-fit w-full flex-col items-center bg-primary sm:items-start">
        <div className="mb-0 flex h-[calc(100svh-theme(spacing.4))] w-full flex-col items-center justify-center bg-login-bg bg-cover bg-center bg-no-repeat p-0 mobile-lg:mb-5 md:p-2">
          <MakeRequest imei={imei} />
        </div>

        <section className="relative w-full bg-[#F5F5F5]">
          <div
            className={cn(
              "z-[1] flex h-fit w-full flex-col justify-between bg-faq bg-cover pt-24 lg:bg-faq",
              "-mt-10 mobile-sm:-mt-6 mobile-lg:-mt-0 md:-mt-14 lg:-mt-14 3xl:-mt-20",
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
                        {question.answer.steps.map(
                          (step, stepIndex: number) => (
                            <div
                              key={stepIndex}
                              className="transform transition-all duration-200"
                            >
                              {renderStepContent(step)}
                            </div>
                          ),
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>

            <div className="mt-16 lg:mt-24"></div>

            <footer
              className={cn(
                "relative z-[20] flex h-fit w-full flex-col items-center justify-between overflow-hidden bg-white px-5 md:mt-0 lg:mt-4 lg:px-0 lg:pl-11",
              )}
            >
              <div className="z-10 flex w-full flex-col-reverse pt-10 lg:flex-row lg:pt-0">
                <div className="flex items-center gap-8">
                  <span className="text-sm font-semibold lg:w-28 lg:text-lg">
                    Siga nas redes sociais
                  </span>

                  <div className="flex gap-2">
                    <Link
                      href="https://www.facebook.com/GovernoParaiba"
                      target="_blank"
                    >
                      <FaFacebookF className="size-5 lg:size-8" />
                    </Link>
                    <Link
                      href="https://www.twitter.com/govparaiba"
                      target="_blank"
                    >
                      <FaXTwitter className="size-5 lg:size-8" />
                    </Link>
                    <Link
                      href="https://www.youtube.com/@govparaibadigital"
                      target="_blank"
                    >
                      <FaYoutube className="size-5 lg:size-8" />
                    </Link>
                    <Link
                      href="https://www.instagram.com/govparaiba"
                      target="_blank"
                    >
                      <FaInstagram className="size-5 lg:size-8" />
                    </Link>
                  </div>
                </div>
                <div className="flex w-full flex-col items-center justify-end lg:flex-row">
                  <Image
                    src={govFull}
                    alt="logo"
                    className="z-10 hidden h-12 w-64 md:w-96 lg:block"
                  />

                  <Image
                    src={govFooterMobile}
                    alt="logo"
                    className="z-10 lg:hidden"
                  />

                  <Image
                    src={footerLogo}
                    alt="logo"
                    className="z-10 lg:h-[75%]"
                  />
                </div>
              </div>

              <span className="my-5 h-0.5 w-full bg-zinc-200 lg:hidden" />

              <div className="z-10 flex w-full flex-col justify-start gap-4 lg:mb-20">
                <span className="hidden text-lg font-semibold lg:block">
                  Documentos
                </span>
                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-medium">
                    Termos de uso e Aviso de política de privacidade
                  </span>
                  <span className="font-medium">
                    Lei geral de proteção de dados (LGPD)
                  </span>
                </div>
              </div>

              <span className="my-5 h-0.5 w-full bg-zinc-200 lg:hidden" />

              <div className="mb-20 flex flex-col lg:mb-10 lg:mt-0 lg:w-[60%] lg:flex-row">
                <span className="z-10 w-full text-center text-sm">
                  Centro Administrativo Estadual – Avenida Dr. João da Mata, nº
                  200 – Jaguaribe – João Pessoa/PB - CEP: 58015-900 Telefones:
                  (83) 36125600/ 36125601/ 36125602{" "}
                </span>

                <Link href="https://sic.pb.gov.br/" target="_blank">
                  <Image
                    src={sicLogo}
                    alt="sic logo"
                    className="h-1/4 self-center"
                  />
                </Link>
              </div>

              <Image
                src={footerLineLeft}
                alt="logo"
                className="absolute -bottom-36 -left-10 z-0 h-[90%] lg:-bottom-5"
              />

              <Image
                src={footerLineRight}
                alt="logo"
                className="absolute -right-20 -top-32 z-0 h-[90%] rotate-[220deg] mobile:-right-24 mobile:-top-28 mobile-lg:-top-24 lg:-bottom-5 lg:-right-20 lg:top-10 lg:rotate-0"
              />
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
