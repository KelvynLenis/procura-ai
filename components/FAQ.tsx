import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { questions } from '@/utils/FAQ'
import { Footer } from './Footer'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import govFullLight from '../assets/icons/gov-full-light.svg'
import govFull from '../assets/icons/gov.png'
import logo from '../assets/icons/logo-footer.svg'
import line from '../assets/images/line02.svg'
import secties from '../assets/images/SECTIES_branco.png'
import gov from '../assets/icons/gov.svg'

interface QuestionStep {
  number: string;
  text: string;
  items?: string[];
  isOptional?: boolean;
}

interface Question {
  question: string;
  answer: {
    steps: QuestionStep[];
  };
}

export function FAQ({ light, homepage }: { bottom?: string, light?: boolean, homepage?: boolean  }) {
  const renderStepContent = (step: QuestionStep) => (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {step.number}
        </div>
        <p className="text-white text-lg leading-relaxed pt-2">
          {step.text}
        </p>
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
    <section
      className={cn(
        'w-full h-fit bg-none lg:bg-faq bg-cover flex flex-col justify-between z-[1]',
        light ? 'lg:pt-10' : 'lg:pt-28 lg:pb-0 sm:pb-0 relative lg:-top-16 3xl:-top-24',
        !light ? 'hidden md:flex' : 'flex'
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
              <AccordionTrigger className={cn(
                "font-normal text-base lg:text-lg px-0 py-6 text-white",
                "hover:no-underline hover:text-gray-300 transition-colors duration-200",
                "[&>svg]:text-white [&>svg]:h-6 [&>svg]:w-6",
                "border-0 bg-transparent"
              )}>
                <span className="text-left w-full">{question.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-0 pb-8 pt-4">
                <div className="space-y-6 pt-4">
                  {question.answer.steps.map((step, stepIndex: number) => (
                    <div key={stepIndex} className="transform transition-all duration-200">
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
        
      {/* <div className='w-full flex-col flex items-center justify-center h-fit py-4 bg-primary md:hidden'>
        <Image src={logo} alt="logo" className='h-full' />
        <Image src={govFullLight} alt="gov" className='h-full' />
      </div> */}
      
      {/* <footer className={cn("w-full relative h-20 md:mt-0 lg:mt-4 flex items-center justify-start z-[20] bg-white")}>
          <Image src={govFull} alt="logo" className='w-64 h-12 md:w-96 z-10' />
          <Image src={line} alt="logo" className='h-full absolute right-0 self-end hidden sm:block md:w-[50%] lg:w-[80%] xl:w-[90%] z-0' />
      </footer> */}
      {
        light ? (
          <footer className={cn("w-full relative h-20 md:mt-0 lg:mt-4 flex items-center justify-start z-[20] bg-white")}>
              <Image src={govFull} alt="logo" className='w-64 h-12 md:w-96 z-10' />
              <Image src={line} alt="logo" className='h-full absolute right-0 self-end hidden sm:block md:w-[50%] lg:w-[80%] xl:w-[90%] z-0' />
            {/* <div className={cn('w-full h-20 flex items-center -mb-4 justify-start pl-9 overflow-hidden')}>
            </div> */}
          </footer>
        ) : (
          <footer className={cn("w-full relative -bottom-20 md:mt-0 lg:mt-4 flex items-center justify-start z-[20] bg-primary py-4")}>
            <div className={cn('w-full items-center pl-9 justify-center hidden lg:flex md:justify-start py-0 px-8 h-14 md:h-fit')}>
              <Image src={secties} alt="logo" className='w-28 md:w-auto md:h-12' />
              <Image src={gov} alt="logo" className='w-28 md:w-auto md:h-12' />            
            </div>
          </footer>
        )
      }



    </section>
  )
}
