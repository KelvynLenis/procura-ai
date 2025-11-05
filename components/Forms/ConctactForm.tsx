"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import { useForm } from "react-hook-form";
import { Input } from "../Input";
import Button from "../Button";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createContact } from "@/functions/contact/create-contact";
import type { Contact } from "@/types";
import { listContacts } from "@/functions/contact/list-contacts";
import { validatePhoneNumber } from "@/lib/utils";
import { updateContact } from "@/functions/contact/update-contact";
import { toast } from "react-toastify";

interface ConctactFormProps {
  contact?: Contact;
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function ConctactForm({
  contact,
  setContacts,
  setIsOpen,
}: ConctactFormProps) {
  const formSchema = z
    .object({
      contact_name: z.string().min(1, {
        message: "O nome é obrigatório.",
      }),
      contact_email: z.string().optional(),
      contact_number: z.string().min(1, {
        message: "O número de contato é obrigatório.",
      }),
    })
    .refine((data) => validatePhoneNumber(data.contact_number), {
      path: ["contact_number"], // Indica onde mostrar o erro
      message: "O número de celular deve conter 11 dígitos numéricos.",
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contact_name: contact?.name_contact || "",
      contact_email: contact?.email_contact || "",
      contact_number: contact?.number_contact || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const callFunction = async () => {
      try {
        if (contact) {
          const updatedContact = await updateContact({
            id: contact?.$id!,
            values,
          });

          if (updatedContact) {
            setIsOpen(false);
            toast.success("Contato atualizado com sucesso!");

            setContacts((prevContacts) =>
              prevContacts.map((c) =>
                c.$id === contact.$id ? updatedContact : c,
              ),
            );
          }

          return;
        }

        const contacts = await listContacts({});

        if (contacts.length >= 3) {
          toast.error("Limite de contatos atingido");
          return;
        }

        const contactCreated = await createContact({ values });

        if (contactCreated) {
          toast.success("Contato criado com sucesso!");
          setIsOpen(false);

          setContacts((prevContacts) => [...prevContacts, contactCreated]);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error("Erro ao salvar o contato");
      }
    };

    toast.promise(callFunction(), {
      pending: "Salvando contato...",
    });
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col items-center justify-between gap-4 self-center rounded-xl px-2 py-4 text-zinc-900"
        >
          {contact
            ? "Atualize as informações do seu contato de confiança."
            : "Adicione um contato de confiança para eventuais contatos de emergência."}
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="flex w-fit items-center text-center">
                  <span className="flex h-6 align-text-bottom text-red-500">
                    *
                  </span>
                  Nome do contato
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    className="ring-1 ring-zinc-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_number"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="flex w-fit items-center text-center">
                  <span className="flex h-6 align-text-bottom text-red-500">
                    *
                  </span>
                  Número do contato
                </FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={11}
                    {...field}
                    className="flex w-full items-center justify-center"
                  >
                    <InputOTPGroup>
                      <span>(</span>
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={0}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={1}
                      />
                      <span>)</span>
                    </InputOTPGroup>
                    <span />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={2}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={3}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={4}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={5}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={6}
                      />
                    </InputOTPGroup>
                    <InputOTPSeparator data-dash />
                    <InputOTPGroup>
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={7}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={8}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={9}
                      />
                      <InputOTPSlot
                        className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5"
                        index={10}
                      />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem className="flex w-full flex-col">
                <FormLabel className="flex w-fit items-center text-center">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    className="ring-1 ring-zinc-300"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            variant="blue"
            type="submit"
            className="flex h-10 w-fit items-center justify-center self-center text-white"
          >
            Salvar
          </Button>
        </form>
      </Form>
    </>
  );
}
