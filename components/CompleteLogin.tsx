"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import logo from "../assets/icons/logo-header.png";
import finishImage from "../assets/images/third-step-image.png";
import { Label } from "./ui/label";
import { Calendar } from "./ui/calendar";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Button from "./Button";
import { Input } from "./Input";
import { cn } from "@/lib/utils";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "./ui/input-otp";
import { account } from "@/lib/appwrite";
import { getUserById } from "@/functions/user/get-user-by-id";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { completeUserData } from "@/functions/user/complete-user-data";
import { toast } from "react-toastify";

export function CompleteLogin() {
  const [dropdown, setDropdown] =
    useState<React.ComponentProps<typeof Calendar>["captionLayout"]>(
      "dropdown",
    );
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [step, setStep] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lat, setLat] = useState<number>();
  const [lng, setLng] = useState();

  const formSchema = z.object({
    cep: z.string().min(8, "O CEP deve conter exatamente 8 dígitos numéricos."),
    street: z.string().min(1, "A rua é obrigatória."),
    number: z.string().min(1, "O número é obrigatório."),
    neighborhood: z.string().min(1, "O bairro é obrigatório."),
    complement: z.string().optional(),
    city: z.string().min(1, "A cidade é obrigatória."),
    state: z.string().min(1, "O estado é obrigatório."),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cep: "",
      street: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      complement: "",
    },
  });

  const cep = form.watch("cep");

  async function validateForm(values: z.infer<typeof formSchema>) {
    form.formState.isSubmitted && setStep(3);
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userAuth = await account.get();
    const user = await completeUserData(userAuth.$id, {
      cep: values.cep,
      address: values.street,
      address_number: values.number,
      neighborhood: values.neighborhood,
      complement: values.complement,
      city: values.city,
      state: values.state,
      birthDate: date?.toISOString() || new Date().toISOString(),
    });

    setIsDialogOpen(false);
  }

  async function getCepByCord(lat: number, lng: number) {
    const text = `${lat},${lng}`;
    const response = await fetch(
      `/api/get-address-by-cep?input=${encodeURIComponent(text)}`,
    );

    const data = await response.json();

    const results = data.results;

    const cepTypeResult = results.find((result: any) =>
      result.types.includes("postal_code"),
    );

    const cep: string = cepTypeResult.address_components[0].long_name;

    form.setValue("cep", cep.replace("-", ""));

    toast.success("CEP encontrado com sucesso!");
    console.log(cep.replace("-", ""));
  }

  useEffect(() => {
    const checkIfItIsFirstTimeLogin = async () => {
      const userAuth = await account.get();

      const user = await getUserById(userAuth.$id);

      if (user?.is_first_login) {
        setIsDialogOpen(true);
      }
    };

    checkIfItIsFirstTimeLogin();
  }, []);

  useEffect(() => {
    if (step === 2) {
      if ("geolocation" in navigator) {
        toast.loading("Buscando cep...");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            toast.dismiss();
            // Success callback: Permission granted, and location data is available
            // console.log("Latitude:", position.coords.latitude);
            // console.log("Longitude:", position.coords.longitude);
            // setLat(position.coords.latitude);
            // setLng(position.coords.longitude);
            getCepByCord(position.coords.latitude, position.coords.longitude);
          },
          (error) => {
            // Error callback: Permission denied or other error occurred
            toast.error("Erro ao buscar cep");
            switch (error.code) {
              case error.PERMISSION_DENIED:
                console.error("User denied the request for Geolocation.");
                // You can display a message to the user explaining why location is needed
                break;
              case error.POSITION_UNAVAILABLE:
                console.error("Location information is unavailable.");
                break;
              case error.TIMEOUT:
                console.error("The request to get user location timed out.");
                break;
              case error.UNKNOWN_ERROR:
                console.error("An unknown error occurred.");
                break;
            }

            setTimeout(() => {
              toast.dismiss();
            }, 1000);
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }, // Optional options
        );
      }
    }
  }, [step]);

  useEffect(() => {
    const searchCep = async () => {
      if (cep.length === 8) {
        console.log(cep);
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

        const data = await response.json();

        form.setValue("street", data.logradouro);
        form.setValue("neighborhood", data.bairro);
        form.setValue("city", data.localidade);
        form.setValue("state", data.estado);
      }
    };

    searchCep();
  }, [cep]);

  return (
    <>
      <Dialog open={isDialogOpen}>
        <DialogTrigger className="hidden">Open</DialogTrigger>
        <DialogContent
          canClose={false}
          className="h-screen w-full gap-0 overflow-auto rounded-lg border-0 bg-white p-0 pb-2 text-primary lg:h-[35rem] lg:w-[50rem] xl:h-[40rem] 3xl:h-[45rem] 3xl:w-[60rem]"
        >
          <DialogHeader className="m-0 flex h-fit lg:pt-4">
            <div className="h-14 w-full rounded-t-lg bg-primary shadow-none ring-1 ring-zinc-300 md:hidden">
              <Image src={logo} alt="logo" className="w-32" />
            </div>
            <Steps step={step} />
            <DialogTitle className="mx-2 w-fit self-start lg:self-center">
              {step === 1 && "Sua conta está quase pronta"}
              {step === 2 && "Informe seu endereço"}
              {step === 3 && "Pronto! A sua conta foi criada"}
            </DialogTitle>
            <DialogDescription className="mx-2 w-fit font-medium text-primary lg:self-center">
              {step === 1 &&
                "Agora você só precisa informar alguns dados básicos"}
              {step === 2 && ""}
              {step === 3 &&
                "Agora você pode cadastrar os seus dispositivos e garantir mais segurança em caso de roubos, furtos ou perdas"}
            </DialogDescription>
          </DialogHeader>
          <div className="h-full self-start px-2">
            <div className="flex h-full flex-col justify-between gap-2 lg:items-center">
              {step === 1 && (
                <>
                  <Label className="mt-2 text-primary">
                    Data de nascimento:
                  </Label>
                  <Input
                    type="date"
                    placeholder="DD/MM/AAAA"
                    value={date!.toISOString().split("T")[0]}
                    className="ring-zinc-300 lg:w-96"
                    onChange={(e) => {
                      const value = e.target.value; // "2025-11-17"
                      setDate(new Date(value + "T00:00:00"));
                    }}
                  />
                  <Calendar
                    mode="single"
                    defaultMonth={date}
                    selected={date}
                    onSelect={setDate}
                    captionLayout={dropdown}
                    className="my-calendar rounded-lg border bg-zinc-100 shadow-sm [--cell-size:2.5rem] mobile:[--cell-size:2.95rem] mobile-lg:[--cell-size:3.4rem] lg:[&_.rdp-day]:h-6 lg:[&_.rdp-day]:w-14 xl:[&_.rdp-day]:h-10 3xl:[&_.rdp-day]:h-14"
                  />
                </>
              )}

              {step === 2 && (
                <Form {...form}>
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={form.handleSubmit(validateForm)}
                  >
                    <FormField
                      control={form.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col gap-5 md:flex-row">
                          <div>
                            <FormLabel className="flex w-fit items-start text-center text-lg">
                              CEP
                            </FormLabel>
                            <FormControl>
                              <InputOTP
                                maxLength={8}
                                {...field}
                                containerClassName="ring-1 ring-zinc-300 shadow-3one"
                                className="flex w-full items-center justify-center"
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot
                                    className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                                    index={0}
                                  />
                                  <InputOTPSlot
                                    className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                                    index={1}
                                  />
                                  <InputOTPSlot
                                    className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                                    index={2}
                                  />
                                  <InputOTPSlot
                                    className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                                    index={3}
                                  />
                                  <InputOTPSlot
                                    className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                                    index={4}
                                  />
                                </InputOTPGroup>
                                <InputOTPSeparator data-dash />
                                <InputOTPGroup>
                                  <InputOTPSlot
                                    className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                                    index={5}
                                  />
                                  <InputOTPSlot
                                    className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                                    index={6}
                                  />
                                  <InputOTPSlot
                                    className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent"
                                    index={7}
                                  />
                                </InputOTPGroup>
                              </InputOTP>
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex w-full flex-col lg:flex-row lg:gap-4">
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem className="flex w-full flex-col gap-5 md:flex-row">
                            <div>
                              <FormLabel className="flex w-fit items-start text-center text-lg">
                                Logradouro
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  {...field}
                                  className="w-full shadow-none ring-zinc-300"
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem className="flex w-fit flex-col gap-5 md:flex-row">
                            <div>
                              <FormLabel className="flex w-fit items-start text-center text-lg">
                                Número
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  className="w-16 shadow-none ring-zinc-300 lg:w-20"
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="complement"
                        render={({ field }) => (
                          <FormItem className="flex w-full flex-col gap-5 md:flex-row">
                            <div>
                              <FormLabel className="flex w-fit items-start text-center text-lg">
                                Complemento(Opcional)
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  {...field}
                                  className="w-full shadow-none ring-zinc-300"
                                />
                              </FormControl>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="neighborhood"
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col gap-5 md:flex-row">
                          <div>
                            <FormLabel className="flex w-fit items-start text-center text-lg">
                              Bairro
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                {...field}
                                className="w-full shadow-none ring-zinc-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col gap-5 md:flex-row">
                          <div>
                            <FormLabel className="flex w-fit items-start text-center text-lg">
                              Cidade
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                {...field}
                                className="w-full shadow-none ring-zinc-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem className="flex w-full flex-col gap-5 md:flex-row">
                          <div>
                            <FormLabel className="flex w-fit items-start text-center text-lg">
                              Estado
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                {...field}
                                className="w-full shadow-none ring-zinc-300"
                              />
                            </FormControl>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex w-full justify-between">
                      <Button
                        variant="blue"
                        onClick={() => setStep(step - 1)}
                        className="self-start"
                      >
                        Voltar
                      </Button>
                      <Button variant="blue" type="submit" className="self-end">
                        Avançar
                      </Button>
                    </div>
                  </form>
                </Form>
              )}

              {step === 3 && (
                <Image
                  src={finishImage}
                  alt=""
                  height={400}
                  className="md:self-center"
                />
              )}

              <div
                className={cn(
                  "flex w-full justify-between self-end",
                  step === 1 && "justify-end",
                )}
              >
                {step === 1 && (
                  <Button
                    variant="blue"
                    onClick={() => setStep(step + 1)}
                    className="self-end"
                  >
                    Avançar
                  </Button>
                )}

                {step === 3 && (
                  <>
                    <Button
                      variant="blue"
                      onClick={() => setStep(step - 1)}
                      className="self-start"
                    >
                      Voltar
                    </Button>
                    <Button
                      variant="blue"
                      onClick={() => onSubmit(form.getValues())}
                      className="self-end"
                    >
                      Concluir
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Steps({ step }: { step: number }) {
  return (
    <div className="flex w-full items-center justify-center gap-2 px-1 lg:w-96 lg:self-center">
      <div
        className={cn(
          "h-1.5 w-full rounded-full bg-zinc-200 transition-all duration-200 ease-in",
          {
            "bg-secondary": step >= 1,
          },
        )}
      />
      <div
        className={cn(
          "h-1.5 w-full rounded-full bg-zinc-200 transition-all duration-200 ease-in",
          {
            "bg-secondary": step >= 2,
          },
        )}
      />
      <div
        className={cn(
          "h-1.5 w-full rounded-full bg-zinc-200 transition-all duration-200 ease-in",
          {
            "bg-secondary": step >= 3,
          },
        )}
      />
    </div>
  );
}
