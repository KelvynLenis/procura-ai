import Image from "next/image";
import { LoginForm } from "@/components/Forms/LoginForm";
import logo from "../../assets/icons/logo-text.svg";
import { cn } from "@/lib/utils";
import { questions } from "@/utils/FAQ";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Question, QuestionStep } from "@/types";

import lineFooter from "../../assets/images/line02.svg";
import govFull from "../../assets/icons/gov.png";

export default function Login() {
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
      <main className="row-start-2 flex min-h-fit w-full flex-col items-center bg-primary sm:items-start">
        <div className="relative flex w-full flex-col bg-login-bg bg-cover bg-center bg-no-repeat">
          <div className="flex w-full">
            <div className="hidden w-full items-center justify-center md:flex">
              {/* <Image src={logoLogin} alt="login images" /> */}
            </div>

            <LoginForm />
          </div>
        </div>

        <div className="relative w-full bg-[#F5F5F5]">
          <section
            className={cn(
              "z-[1] flex h-fit w-full flex-col justify-between bg-faq bg-cover pt-24 lg:bg-faq",
              "-mt-14",
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
          </section>
          {/* <section
            className={cn(
              "w-full h-fit bg-faq bg-cover lg:bg-faq flex flex-col justify-between z-[1] pt-24",
              "-mt-14",
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
          </section> */}
        </div>
      </main>
    </>
  );
}
