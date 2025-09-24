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

export function FAQ({ light, homepage }: { bottom?: string, light?: boolean, homepage?: boolean  }) {
  return (
    <section
      className={cn(
        'w-full h-fit bg-none lg:bg-faq bg-cover flex flex-col justify-between z-[1]',
        homepage ? 'lg:pt-10' : 'lg:pt-28 lg:pb-0 sm:pb-0 relative lg:-top-16 3xl:-top-24',
        light ? 'bg-faq-light': 'bg-faq',
      )}
    >
      <div className=" flex-col gap-5 w-full h-full px-4 lg:px-32 hidden lg:flex">
        <h2 className={cn(" font-bold text-3xl self-center text-center", light ? 'text-primary' : 'text-white')}>
          Perguntas frequentes
        </h2>

        <div className="w-full flex flex-col gap-6">
          {questions.map((question, index) => (
            <Accordion key={index} type="single" collapsible>
              <AccordionItem
                className="bg-white rounded-xl text-primary flex flex-col gap-0"
                value={`item-${index}`}
              >
                <AccordionTrigger className="font-bold text-2xl px-5 rounded-xl outline-1 outline-secondary">
                  {question.question}
                </AccordionTrigger>
                <AccordionContent className="px-5 pt-3 text-xl">
                  {question.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      </div>
        
      <div className='w-full flex-col flex items-center justify-center h-fit py-4 bg-primary md:hidden'>
        <Image src={logo} alt="logo" className='h-full' />
        <Image src={govFullLight} alt="gov" className='h-full' />
      </div>
      
      {
        homepage ? (
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
      {/* <div className={cn('w-full absolute -bottom-20 hidden lg:flex', `bottom-${bottom}`)}>
        <Footer light={!light} homepage={homepage} />
      </div> */}

    </section>
  )
}
