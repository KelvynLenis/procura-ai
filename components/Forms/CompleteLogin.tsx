"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Calendar } from "../ui/calendar";
import Button from "../Button";
import { Input } from "../Input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../ui/input-otp";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "../ui/checkbox";

import { account } from "@/lib/appwrite";
import { getUserById } from "@/functions/user/get-user-by-id";
import { completeUserData } from "@/functions/user/complete-user-data";
import { cn } from "@/lib/utils";

import colorfuLine from "../../assets/images/colorful-line.png";
import logo from "../../assets/icons/logo-header.png";
import finishImage from "../../assets/images/third-step-image.png";
import { CircleCheck } from "lucide-react";

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
  const [isTermsOfUseChecked, setIsTermsOfuseChecked] = useState(false);
  const [isPrivacyPolicyChecked, setIsPrivacyPolicyChecked] = useState(false);

  const formSchema = z.object({
    cep: z.string().min(8, "O CEP deve conter exatamente 8 dígitos numéricos."),
    street: z.string().min(1, "A rua é obrigatória."),
    number: z.string().min(1, "O número é obrigatório."),
    neighborhood: z.string().min(1, "O bairro é obrigatório."),
    complement: z.string().optional(),
    city: z.string().min(1, "A cidade é obrigatória."),
    state: z.string().min(1, "O estado é obrigatório."),
    birthDate: z.string().min(1, "A data de nascimento é obrigatória."),
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
      birthDate: "",
    },
  });

  const cep = form.watch("cep");

  async function validateForm(values: z.infer<typeof formSchema>) {
    form.formState.isSubmitted && setStep(2);
  }

  function validateCheckbox() {
    if (isTermsOfUseChecked && isPrivacyPolicyChecked) {
      setStep(3);
    } else {
      toast.error("Os termos de uso e privacidade devem ser aceitos.");
    }
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

      if (step === 1 && user?.is_first_login) {
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
    };

    checkIfItIsFirstTimeLogin();
  }, []);

  // useEffect(() => {
  //   if (step === 1 && window.screen.width >= 768) {
  //     if ("geolocation" in navigator) {
  //       toast.loading("Buscando cep...");
  //       navigator.geolocation.getCurrentPosition(
  //         (position) => {
  //           toast.dismiss();
  //           // Success callback: Permission granted, and location data is available
  //           // console.log("Latitude:", position.coords.latitude);
  //           // console.log("Longitude:", position.coords.longitude);
  //           // setLat(position.coords.latitude);
  //           // setLng(position.coords.longitude);
  //           getCepByCord(position.coords.latitude, position.coords.longitude);
  //         },
  //         (error) => {
  //           // Error callback: Permission denied or other error occurred
  //           toast.error("Erro ao buscar cep");
  //           switch (error.code) {
  //             case error.PERMISSION_DENIED:
  //               console.error("User denied the request for Geolocation.");
  //               // You can display a message to the user explaining why location is needed
  //               break;
  //             case error.POSITION_UNAVAILABLE:
  //               console.error("Location information is unavailable.");
  //               break;
  //             case error.TIMEOUT:
  //               console.error("The request to get user location timed out.");
  //               break;
  //             case error.UNKNOWN_ERROR:
  //               console.error("An unknown error occurred.");
  //               break;
  //           }

  //           setTimeout(() => {
  //             toast.dismiss();
  //           }, 1000);
  //         },
  //         { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }, // Optional options
  //       );
  //     }
  //   }
  // }, [step]);

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
          className="h-screen w-full gap-0 overflow-auto rounded-lg border-0 bg-white p-0 pb-2 text-primary lg:h-[33rem] lg:w-[50rem] xl:h-[35rem] 3xl:h-[45rem] 3xl:w-[60rem]"
        >
          <DialogHeader className="m-0 flex h-fit lg:pt-2">
            <div className="h-14 w-full rounded-t-lg bg-primary shadow-none ring-1 ring-zinc-300 md:hidden">
              <Image src={logo} alt="logo" className="w-32" />
            </div>
            <Steps step={step} />
            <DialogTitle className="h-fit w-fit self-start px-4 text-base md:text-lg">
              {step >= 1 && "Sua conta está quase pronta"}
              {step === 3 && "Pronto! A sua conta foi criada"}
            </DialogTitle>
            <DialogDescription className="w-fit px-4 text-xs font-medium text-primary md:text-base">
              {step === 1 &&
                "Agora você só precisa informar alguns dados básicos"}
              {step === 2 &&
                "Para finalizar seu cadastro leia e concorde com os termos abaixo"}
              {step === 3 &&
                "Agora você pode cadastrar os seus dispositivos e garantir mais segurança em caso de roubos, furtos ou perdas"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex h-full flex-col gap-2 px-4 lg:items-start">
            {step === 1 && (
              <>
                <Form {...form}>
                  <form
                    className="flex h-full w-full flex-col justify-between"
                    onSubmit={form.handleSubmit(validateForm)}
                  >
                    <div className="flex flex-col gap-1">
                      <FormField
                        control={form.control}
                        name="birthDate"
                        render={({ field }) => (
                          <FormItem className="flex w-full flex-col gap-2">
                            <FormLabel className="text-base text-primary">
                              Insira sua data de nascimento:
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                placeholder="DD/MM/AAAA"
                                className="mt-0 ring-zinc-300 lg:w-52"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <span className="my-2 h-[1px] w-full bg-zinc-400" />

                      <span className="font-medium">
                        Informe o seu endereço
                      </span>

                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem className="flex w-full flex-col gap-2 md:w-fit">
                            <FormLabel className="flex w-full items-start text-center md:w-fit">
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
                          </FormItem>
                        )}
                      />

                      <div className="flex w-full flex-row items-center justify-between gap-4 md:justify-normal">
                        <FormField
                          control={form.control}
                          name="street"
                          render={({ field }) => (
                            <FormItem className="flex w-full flex-col gap-2 md:w-fit">
                              <FormLabel className="flex w-fit items-start text-center text-base">
                                Logradouro
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  {...field}
                                  className="w-full shadow-none ring-zinc-300 lg:w-80"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="number"
                          render={({ field }) => (
                            <FormItem className="mt-1 flex w-fit flex-col gap-0 md:mt-0 md:w-fit">
                              <FormLabel className="flex w-fit items-start text-center text-base">
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
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex w-full flex-col gap-2 lg:flex-row lg:gap-4">
                        <FormField
                          control={form.control}
                          name="neighborhood"
                          render={({ field }) => (
                            <FormItem className="mt-1 flex w-full flex-col gap-0 md:mt-0 md:w-fit">
                              <FormLabel className="flex w-fit items-start text-center text-base">
                                Bairro
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  {...field}
                                  className="w-full shadow-none ring-zinc-300 lg:w-80"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem className="mt-1 flex w-full flex-col gap-0 md:mt-0 md:w-fit">
                              <FormLabel className="flex w-fit items-start text-center text-base">
                                Cidade
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  {...field}
                                  className="w-full shadow-none ring-zinc-300 lg:w-80"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="mt-0 flex w-full justify-end">
                      {/* <Button
                          variant="blue"
                          onClick={() => setStep(step - 1)}
                          className="self-start"
                        >
                          Voltar
                        </Button> */}
                      <Button variant="blue" type="submit" className="self-end">
                        Avançar
                      </Button>
                    </div>
                  </form>
                </Form>

                {/* <Calendar
                    mode="single"
                    defaultMonth={date}
                    selected={date}
                    onSelect={setDate}
                    captionLayout={dropdown}
                    className="my-calendar rounded-lg border bg-zinc-100 shadow-sm [--cell-size:2.5rem] mobile:[--cell-size:2.95rem] mobile-lg:[--cell-size:3.4rem] lg:[&_.rdp-day]:h-6 lg:[&_.rdp-day]:w-14 xl:[&_.rdp-day]:h-8 3xl:[&_.rdp-day]:h-14"
                  /> */}
              </>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-3">
                <span className="my-2 h-[1px] w-full bg-zinc-400" />

                <h1 className="font-medium text-secondary" id="termos">
                  Termos de uso
                </h1>

                <p className="text-justify text-sm">
                  O Procura.Ai é um sistema desenvolvido com o selo da
                  Secretaria de Ciência, Tecnologia, Inovação e Ensino Superior
                  do Estado da Paraíba.  Seu principal objetivo é disponibilizar
                  uma ferramenta destinada a auxiliar na recuperação de
                  dispositivos perdidos, roubados ou furtados no contexto da
                  Paraíba, com integração de dados e automação de processos de
                  monitoramento e controle. O Procura.Ai foi projetado para
                  executar apenas os processamentos de dados essenciais para o
                  cadastro de usuários, seus dispositivos eletrônicos  e as
                  ocorrências monitoradas pelo sistema.
                </p>

                <h2 className="font-medium">Compromisso com a Privacidade</h2>

                <p className="text-justify text-sm">
                  Nosso compromisso é garantir a segurança, privacidade e
                  proteção dos dados pessoais de todos os usuários que utilizam
                  a plataforma. Todos os dados coletados e processados pelo
                  Procura.Ai são tratados de acordo com a Lei Geral de Proteção
                  de Dados Pessoais (LGPD - Lei nº 13.709/2018). Esses dados
                  serão utilizados exclusivamente para os fins descritos, e não
                  serão compartilhados com terceiros sem o consentimento
                  explícito dos usuários, exceto quando exigido por lei.
                </p>

                <p className="text-justify text-sm">
                  Ao utilizar o Procura.Ai, o usuário concorda com a coleta e o
                  uso de suas informações conforme descrito nesta política. Para
                  dúvidas ou exercício dos direitos previstos na LGPD, como a
                  solicitação de acesso, correção ou exclusão de dados, o
                  usuário pode entrar em contato pelos canais disponíveis na
                  plataforma.
                </p>

                <h2 className="font-medium">Responsabilidades dos Usuários</h2>

                <p className="text-justify text-sm">
                  O uso do Procura.Ai é restrito aos cidadãos e residentes do
                  estado da Paraíba, que tenham o interesse de cadastrar seus
                  aparelhos eletrônicos em nossa plataforma a fim de ampliar a
                  segurança dos dispositivos. Ao utilizar a plataforma, os
                  usuários se comprometem a:
                </p>

                <ul className="list-disc px-4">
                  <li>
                    Usar suas contas pessoais e manter as senhas em sigilo;
                  </li>
                  <li>Não compartilhar senhas ou contas com terceiros;</li>
                  <li>
                    Respeitar os direitos de privacidade e segurança de outros
                    usuários.
                  </li>
                </ul>

                <h2 className="font-medium">Limitações de Responsabilidade</h2>

                <p className="text-justify text-sm">
                  O Procura.Ai não se responsabiliza por problemas decorrentes
                  de fatores externos ao sistema, como:
                </p>

                <ul className="list-disc px-4">
                  <li>Equipamentos infectados ou comprometidos;</li>
                  <li>Proteção inadequada dos dispositivos dos usuários;</li>
                  <li>Monitoramento ilegal de dispositivos</li>
                </ul>

                <h1 className="font-medium text-secondary" id="politica">
                  Aviso de Política de Privacidade
                </h1>

                <h2 className="font-medium">Finalidade dos Dados Coletados</h2>

                <p className="text-justify text-sm">
                  Os dados são coletados por meio da autenticação no GOV.br para
                  verificar a identidade do usuário, confirmando que ele é um
                  cidadão com CPF válido, único. Esses dados são utilizados
                  exclusivamente para autenticação e para garantir a integridade
                  do processo de acesso e utilização da plataforma Procura.Ai.
                </p>

                <h2 className="font-medium">Dados coletados</h2>

                <p className="text-justify text-sm">
                  Os dados coletados incluem: nome completo, endereço de e-mail,
                  CPF, número de contato (telefone/celular) e data de
                  nascimento. Estes dados são obtidos automaticamente ao
                  autenticar-se pela primeira vez no aplicativo via GOV.br. O
                  uso do Procura.Ai implica a concordância com esta Política de
                  Privacidade. Opcionalmente, os usuários podem adicionar
                  contatos de confiança para receber notificações do sistema em
                  casos de ocorrência urgente. 
                </p>

                <h2 className="font-medium">Uso dos dados</h2>

                <p>
                  Os dados são utilizados para:
                  <ul className="list-disc px-4">
                    <li>
                      Verificar a identidade do usuário e garantir que seja um
                      cidadão com CPF válido, único;
                    </li>
                    <li>Confirmar, quando informado, que é maior de idade;</li>
                    <li>
                      Permitir a autenticação segura e o acesso às
                      funcionalidades do Procura.Ai;
                    </li>
                    <li>
                      Enviar comunicações/notificações relevantes relacionadas à
                      plataforma;
                    </li>
                    <li>
                      Gerar relatórios internos para melhoria contínua dos
                      serviços.
                    </li>
                    <li>
                      Em casos de indivíduos menores de idade, será requisitado
                      o cadastro de um responsável em seus contatos de
                      confiança.
                    </li>
                  </ul>
                </p>

                <p className="text-justify text-sm">
                  Esses dados não serão compartilhados com terceiros fora do
                  Procura.Ai, exceto quando expressamente autorizado pelo
                  usuário ou exigido por lei.
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={isTermsOfUseChecked}
                    onCheckedChange={(checked) =>
                      setIsTermsOfuseChecked(checked === true)
                    }
                    className="shadow-none data-[state=checked]:bg-secondary"
                  />
                  <span>
                    Eu declaro que li e concordo com os{" "}
                    <button
                      className="text-secondary underline"
                      onClick={() => {
                        document.getElementById("termos")?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                    >
                      Termos de Uso
                    </button>{" "}
                    estabelecidos pelo Procura.Aí.
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={isPrivacyPolicyChecked}
                    onCheckedChange={(checked) =>
                      setIsPrivacyPolicyChecked(checked === true)
                    }
                    className="shadow-none data-[state=checked]:bg-secondary"
                  />
                  <span>
                    Eu declaro que li e concordo com a{" "}
                    <button
                      className="text-secondary underline"
                      onClick={() => {
                        document.getElementById("politica")?.scrollIntoView({
                          behavior: "smooth",
                        });
                      }}
                    >
                      Política de Privacidade
                    </button>{" "}
                    estabelecida pelo Procura.Aí.
                  </span>
                </div>

                <div className="mt-0 flex w-full justify-between">
                  <Button
                    variant="blue"
                    onClick={() => setStep(step - 1)}
                    className="self-start"
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="blue"
                    type="button"
                    onClick={validateCheckbox}
                    className="self-end"
                  >
                    Avançar
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <>
                <Image
                  src={finishImage}
                  alt=""
                  height={350}
                  className="md:self-center"
                />
                <div className="mt-0 flex w-full justify-between">
                  <Button
                    variant="blue"
                    onClick={() => setStep(step - 1)}
                    className="self-start"
                  >
                    Voltar
                  </Button>
                  <Button
                    variant="blue"
                    type="button"
                    onClick={() => onSubmit(form.getValues())}
                    className="self-end"
                  >
                    Finalizar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Steps({ step }: { step: number }) {
  return (
    <div className="flex w-full items-center justify-center gap-0 px-1 lg:w-full lg:self-center">
      {/* <div
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
          "hidden h-1.5 w-full rounded-full bg-zinc-200 transition-all duration-200 ease-in md:block",
          {
            "bg-secondary": step >= 3,
          },
        )}
      /> */}

      <Image
        src={colorfuLine}
        alt=""
        className="w-72 mobile:w-80 mobile-lg:w-96 md:w-full"
      />
      <CircleCheck
        className={cn(
          "h-4",
          step === 3 ? "fill-lime-500 text-white" : "fill-zinc-500 text-white",
        )}
      />
    </div>
  );
}
