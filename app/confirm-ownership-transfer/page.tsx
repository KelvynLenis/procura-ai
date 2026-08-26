"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

import { QuestionStep } from "@/types";

import govFooterMobile from "../../assets/icons/gov-footer-mobile.png";
import sicLogo from "../../assets/icons/sic_logo.png";
import logo from "../../assets/icons/logo-text.svg";
import footerLineLeft from "../../assets/icons/footer-line-left.svg";
import footerLineRight from "../../assets/icons/footer-line-right.svg";
import footerLogo from "../../assets/icons/logo-dark.svg";
import govFull from "../../assets/icons/gov.png";

import { FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";

import Link from "next/link";
import ConfirmWrapper from "./ConfirmWrapper";

export default async function ConfirmOwnershipTransfer({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const token = resolvedParams.token;

  return (
    <>
      <header className="h-15 sticky z-10 flex items-center bg-primary px-5 pt-2 shadow-lg">
        <Image src={logo} alt="logo" className="relative -left-8 h-16" />
      </header>
      <main className="row-start-2 flex h-full min-h-fit w-full flex-col items-center bg-primary sm:items-start">
        <div className="mb-0 flex h-[calc(100svh-theme(spacing.4))] w-full flex-col bg-white p-4 md:p-2">
          <ConfirmWrapper token={token as string} />
        </div>

        <section className="relative w-full bg-[#F5F5F5]">
          <div
            className={cn(
              "z-[1] flex h-fit w-full flex-col justify-between",
              "-mt-10 mobile-sm:-mt-6 mobile-lg:-mt-0 md:-mt-14 lg:-mt-14 3xl:-mt-20",
            )}
          >
            <footer
              className={cn(
                "relative flex h-fit w-full flex-col items-center justify-between overflow-hidden bg-white px-5 md:mt-0 lg:mt-4 lg:px-0 lg:pl-11",
              )}
            >
              <div className="z-[1] flex w-full flex-col-reverse pt-10 lg:flex-row lg:pt-0">
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
                <div className="z-[1] flex w-full flex-col items-center justify-end lg:flex-row">
                  <Image
                    src={govFull}
                    alt="logo do governo da paraiba"
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

              <span className="z-[1] my-5 h-0.5 w-full bg-zinc-200 lg:hidden" />

              <div className="z-[1] flex w-full flex-col justify-start gap-4 lg:mb-20">
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

              <span className="z-[1] my-5 h-0.5 w-full bg-zinc-200 lg:hidden" />

              <div className="z-[1] mb-20 flex flex-col lg:mb-10 lg:mt-0 lg:w-[60%] lg:flex-row">
                <span className="w-full text-center text-sm">
                  Centro Administrativo Estadual – Avenida Dr. João da Mata, nº
                  200 – Jaguaribe – João Pessoa/PB - CEP: 58015-900 Telefones:
                  (83) 36125600/ 36125601/ 36125602{" "}
                </span>

                <Link
                  href="https://sic.pb.gov.br/"
                  target="_blank"
                  className="flex items-center justify-center"
                >
                  <Image src={sicLogo} alt="sic logo" className="h-1/4" />
                </Link>
              </div>

              <Image
                src={footerLineLeft}
                alt="forma de fundo azul e verde"
                className="absolute -bottom-36 -left-10 z-0 h-[90%] lg:-bottom-5"
              />

              <Image
                src={footerLineRight}
                alt="forma de fundo roxo e rosa"
                className="absolute -right-20 -top-32 z-0 h-[90%] rotate-[220deg] mobile:-right-24 mobile:-top-28 mobile-lg:-top-24 lg:-bottom-5 lg:-right-20 lg:top-10 lg:rotate-0"
              />
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}
