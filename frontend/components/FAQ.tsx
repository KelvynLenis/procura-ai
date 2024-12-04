import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { questions } from "@/utils/FAQ"

export function FAQ() {

  return (
    <section className='w-full h-fit bg-faq bg-cover flex justify-center pt-28 pb-10'>
      <div className="flex flex-col gap-5 w-full h-full px-4 lg:px-32">
        <h2 className='text-secondary font-bold text-2xl self-center'>Perguntas frequentes</h2>

        <div className="w-full flex flex-col gap-6">
          {
            questions.map((question, index) => (
              <Accordion key={index} type="single" collapsible>
                <AccordionItem className="bg-white rounded-xl text-secondary flex flex-col gap-0" value={`item-${index}`}>
                  <AccordionTrigger className="font-bold text-xl px-5 rounded-xl outline-1 outline-secondary">{question.question}</AccordionTrigger>
                  <AccordionContent className="px-5 pt-3">{question.answer}</AccordionContent>
                </AccordionItem>
              </Accordion>
            ))
          }
        </div>
      </div>

    </section>
  )
}