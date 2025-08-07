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
import govFull from '../assets/icons/gov-full-light.svg'
import logo from '../assets/icons/logo-footer.svg'

export function FAQ({ bottom, light, homepage }: { bottom?: string, light?: boolean, homepage?: boolean  }) {
  return (
    <section
      className={cn(
        'w-full h-fit bg-none lg:bg-faq bg-cover flex flex-col justify-between lg:pt-28 lg:pb-28 sm:pb-0 relative lg:-top-16 3xl:-top-24',
        `-top-${bottom}`,
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
        
      <div className='w-full flex-col flex items-center justify-center h-fit py-4 bg-primary lg:hidden'>
        <Image src={logo} alt="logo" className='h-full' />
        <Image src={govFull} alt="gov" className='h-full' />
      </div>
      
      <div className={cn(' w-full absolute -bottom-20 hidden lg:flex', `bottom-${bottom}`)}>
          <Footer light={!light} homepage={homepage} />
      </div>

    </section>
  )
}
