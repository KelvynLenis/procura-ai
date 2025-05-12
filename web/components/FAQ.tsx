import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { questions } from '@/utils/FAQ'
import { Footer } from './Footer'
import { cn } from '@/lib/utils'

export function FAQ({ bottom }: { bottom?: string }) {
  return (
    <section
      className={cn(
        'w-full h-fit  bg-faq bg-cover flex flex-col justify-between pt-28 pb-20 sm:pb-0 relative -top-28',
        `top-${bottom}`
      )}
    >
      <div className="flex flex-col gap-5 w-full h-full px-4 lg:px-32">
        <h2 className="text-secondary font-bold text-3xl self-center">
          Perguntas frequentes
        </h2>

        <div className="w-full flex flex-col gap-6">
          {questions.map((question, index) => (
            <Accordion key={index} type="single" collapsible>
              <AccordionItem
                className="bg-white rounded-xl text-secondary flex flex-col gap-0"
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

      <div
        className={cn('flex w-full absolute -bottom-28', `bottom-${bottom}`)}
      >
        <Footer />
      </div>
    </section>
  )
}
