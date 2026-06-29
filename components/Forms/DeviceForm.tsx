"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Button from "../Button";
import { Button as ButtonShadcn } from "../ui/button";
import { Input } from "../ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "../ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { account } from "@/lib/appwrite";
import type { Device, DeviceProps } from "@/types";
import {
  cn,
  validatePhoneNumber,
  validateImeiFormat,
  validateImeiWithLuhn,
} from "@/lib/utils";

import { Check, ChevronDown } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";

import { createDevice } from "@/functions/device/create-device";
import { updateDevice } from "@/functions/device/update-device";
import { checkImei } from "@/functions/device/check-imei";
import { LoadingToast } from "../LoadingToast";
import { listOperators } from "@/functions/operators/list-operators";
import type { Operator } from "@/types";
import { useStatus } from "@/hooks/useStatus";

interface AddDeviceFormProps {
  device?: DeviceProps;
  setModalOpen?: (value: boolean) => void;
  isPopover?: boolean;
}

export function DeviceForm({
  device,
  setModalOpen,
  isPopover,
}: AddDeviceFormProps) {
  const [open, setOpen] = useState(false);
  const [isBrandsPopoverOpen, setIsBrandsPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imeiError, setImeiError] = useState<string>("");
  const [operatorOptions, setOperatorOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [operatorsLoaded, setOperatorsLoaded] = useState(false);
  const route = useRouter();
  const { userStatus } = useStatus();

  const formSchema = z
    .object({
      phone_model: z.string().min(1, {
        message: "O modelo do dispositivo é obrigatório.",
      }),
      phone_number: z.string().min(11, {
        message:
          "O número de celular deve conter exatamente 11 dígitos numéricos.",
      }),
      brand: z.string().min(1, {
        message: "O fabricante do dispositivo é obrigatório.",
      }),
      operator_id: z.string().optional(),
      imei: z.string().min(15, {
        message: "O IMEI deve conter exatamente 15 dígitos numéricos.",
      }),
    })
    .refine((data) => validateImeiFormat(data.imei), {
      path: ["imei"],
      message: "O IMEI deve conter exatamente 15 dígitos numéricos.",
    })
    .refine((data) => validateImeiWithLuhn(data.imei), {
      path: ["imei"],
      message: "IMEI inválido. Por favor, verifique o número.",
    })
    .refine((data) => validatePhoneNumber(data.phone_number), {
      path: ["phone_number"],
      message:
        "O número de celular deve conter exatamente 11 dígitos numéricos.",
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phone_number: device?.phone_number || "",
      phone_model: device?.phone_model || "",
      // operator_id: '',
      brand: device?.brand || "",
      imei: device?.imei || "",
    },
  });

  useEffect(() => {
    const loadOperators = async () => {
      try {
        setOperatorsLoaded(false);
        const options = await getOperatorOptions();
        setOperatorOptions(options);
        setOperatorsLoaded(true);

        if (device?.operator_id) {
          form.setValue("operator_id", device.operator_id);
        }
      } catch (error) {
        console.error("Erro ao carregar operadoras:", error);
        setOperatorsLoaded(true);
        // Define operadoras fallback para teste
        setOperatorOptions([
          { label: "Vivo", value: "vivo" },
          { label: "Claro", value: "claro" },
          { label: "TIM", value: "tim" },
          { label: "Oi", value: "oi" },
        ]);
      }
    };

    loadOperators();
  }, [device, form]);

  useEffect(() => {
    const imeiValue = form.watch("imei");

    if (imeiValue && imeiValue.length === 15) {
      const validateAndFillForm = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(
            `https://alpha.imeicheck.com/api/free_with_key/modelBrandName?key=${process.env.NEXT_PUBLIC_API_KEY_IMEICHECK}&imei=${imeiValue}&format=json`,
          );

          if (!response.ok) {
            toast.error("Erro ao validar IMEI. Por favor, tente novamente.");
            return;
          }

          const data = await response.json();

          if (data.status === "succes" && data.object) {
            form.setValue("brand", data.object.brand);
            form.setValue("phone_model", data.object.name);
          } else {
            toast.error("Não foi possível obter informações do IMEI.");
          }
        } catch (error) {
          console.error("Erro ao validar IMEI:", error);
          toast.error("Erro ao validar IMEI. Por favor, tente novamente.");
        } finally {
          setIsLoading(false);
        }
      };

      validateAndFillForm();
    }
  }, [form.watch("imei")]);

  const router = useRouter();

  function goBack() {
    router.back();
  }

  // Função para formatar IMEI (apenas mobile)
  const formatImei = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 15);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 8)
      return `${numbers.slice(0, 2)} ${numbers.slice(2)}`;
    if (numbers.length <= 14)
      return `${numbers.slice(0, 2)} ${numbers.slice(2, 8)} ${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)} ${numbers.slice(2, 8)} ${numbers.slice(8, 14)} ${numbers.slice(14)}`;
  };

  // Função para formatar telefone (apenas mobile)
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 2) return numbers.length === 0 ? "" : `(${numbers}`;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  };

  async function onSubmit(values: DeviceProps) {
    if (userStatus !== "Ativo") {
      toast.info("Funcionalidade indisponível para acesso limitado.");
      return;
    }

    try {
      setIsLoading(true);
      setImeiError("");
      const { $id: userId } = await account.get();

      if (device) {
        await handleEditDevice(device.$id!, values);
        return;
      }

      const imeiValidation = await checkImei(
        values.imei,
        values.brand,
        values.phone_model,
      );

      if (!imeiValidation.isValid) {
        setImeiError(imeiValidation.error || "Erro ao validar IMEI");
        setIsLoading(false);
        return;
      }

      if (imeiValidation.isValid && imeiValidation.isUpdate) {
        const updateDevicePromise = async () => {
          try {
            await updateDevice(
              imeiValidation.deviceId!,
              {
                phone_number: values.phone_number,
                phone_model: values.phone_model,
                brand: values.brand,
                imei: values.imei,
                is_stolen: false,
                operator_id: values.operator_id,
              } as Device,
              userId,
            );
            form.reset();

            router.push("/meus-dispositivos");
          } catch (error) {
            console.error(`Erro ao criar dispositivo: ${error}`);
            throw error;
          }
        };

        toast.promise(updateDevicePromise(), {
          pending: "Criando dispositivo...",
          success: "Dispositivo criado com sucesso!",
          error: "Erro ao criar dispositivo.",
        });

        return;
      }

      const deviceId = uuidv4();

      const createDevicePromise = async () => {
        try {
          await createDevice(deviceId, values as Device, userId);
          form.reset();

          router.push("/meus-dispositivos");
        } catch (error) {
          console.error(`Erro ao criar dispositivo: ${error}`);
          throw error;
        }
      };

      toast.promise(createDevicePromise(), {
        pending: "Criando dispositivo...",
        success: "Dispositivo criado com sucesso!",
        error: "Erro ao criar dispositivo.",
      });
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar a operação.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleEditDevice(id: string, values: DeviceProps) {
    try {
      const { $id: userId } = await account.get();

      const callFunction = async () => {
        try {
          await updateDevice(id, values as Device, userId);
          route.push("/meus-dispositivos");
        } catch (error) {
          console.error("Erro ao atualizar dispositivo:", error);
          throw error;
        }
      };

      await toast.promise(callFunction(), {
        pending: "Atualizando dispositivo...",
        success: "Dispositivo atualizado com sucesso!",
        error: "Erro ao atualizar dispositivo.",
      });
    } catch (error) {
      console.error("Erro ao atualizar dispositivo:", error);
      toast.error("Erro ao atualizar dispositivo. Tente novamente.");
    }
  }

  return (
    <>
      {/* {isLoading && <LoadingToast isReactToastifyComponent={false} />} */}

      {/* Layout Desktop - mantém o formato original */}
      <div className="hidden md:block">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-8 self-center rounded-3xl bg-white px-5 py-4 text-zinc-900 shadow-md md:w-10/12 md:px-10 lg:w-full",
            )}
          >
            {!device && (
              <div className="flex w-full flex-col gap-2">
                <span className="font-medium">Insira os dados abaixo:</span>
                <div className="flex w-full flex-col gap-1">
                  <span className="h-0.5 w-full bg-zinc-400" />
                  <span className="flex items-start text-sm text-red-500">
                    *Campos obrigatórios
                  </span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="imei"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col gap-5 md:flex-row">
                  <div>
                    <FormLabel className="flex w-fit items-start text-center text-lg">
                      <span className="text-base text-red-500">*</span>
                      IMEI
                    </FormLabel>
                    <FormControl>
                      <InputOTP
                        maxLength={15}
                        {...field}
                        className="flex w-full items-center justify-center"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={0}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={1}
                          />
                        </InputOTPGroup>
                        <span />
                        <InputOTPGroup>
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={2}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={3}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={4}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={5}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={6}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={7}
                          />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={8}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={9}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={10}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={11}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={12}
                          />
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={13}
                          />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot
                            className="h-5 w-3 border-r-0 border-t-0 border-black shadow-transparent md:w-4 xl:w-6"
                            index={14}
                          />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage>{imeiError}</FormMessage>
                  </div>
                  <span className="w-64 rounded-xl bg-[#C4F3F2] px-4 py-2 font-medium text-procura-ai-black/60 md:w-80">
                    🛈 O IMEI é composto por 15 números e pode ser encontrado na
                    embalagem do aparelho ou digitando *#06# no teclado do
                    aparelho.
                  </span>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem className="flex flex-col self-start md:w-fit">
                  <FormLabel className="flex w-fit items-start text-center text-lg">
                    <span className="text-base text-red-500">*</span>
                    Número do celular
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
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={0}
                        />
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={1}
                        />
                        <span>)</span>
                      </InputOTPGroup>
                      <span />
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={2}
                        />
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={3}
                        />
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={4}
                        />
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={5}
                        />
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={6}
                        />
                      </InputOTPGroup>
                      <InputOTPSeparator data-dash />
                      <InputOTPGroup>
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={7}
                        />
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={8}
                        />
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
                          index={9}
                        />
                        <InputOTPSlot
                          className="h-5 w-4 border-r-0 border-t-0 border-black shadow-transparent md:w-5 xl:w-6"
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
              name="brand"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col self-start md:w-fit">
                  <FormLabel className="flex w-fit items-start text-center text-lg">
                    Fabricante
                  </FormLabel>
                  <Popover
                    open={isBrandsPopoverOpen}
                    onOpenChange={setIsBrandsPopoverOpen}
                  >
                    <PopoverTrigger asChild disabled>
                      <div className="w-full self-start md:w-fit">
                        <FormControl>
                          <ButtonShadcn
                            variant="outline"
                            role="combobox"
                            type="button"
                            disabled
                            className={cn(
                              "w-full justify-between gap-0 bg-zinc-100 p-2 text-xs md:w-96 md:p-4 md:text-base lg:gap-2 xl:w-[25.5rem]",
                              !field.value &&
                                "text-muted-foreground text-zinc-500",
                              "cursor-not-allowed opacity-50",
                            )}
                          >
                            {field.value || "Aguardando IMEI..."}
                          </ButtonShadcn>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </PopoverTrigger>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone_model"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col self-start md:w-fit">
                  <FormLabel className="flex w-fit items-start text-center text-lg">
                    Modelo do dispositivo
                  </FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild disabled>
                      <div className="w-full self-start md:w-fit">
                        <FormControl>
                          <ButtonShadcn
                            variant="outline"
                            role="combobox"
                            type="button"
                            disabled
                            className={cn(
                              "w-full justify-between gap-0 bg-zinc-100 p-2 text-xs md:w-96 md:p-4 md:text-base lg:gap-2 xl:w-[25.5rem]",
                              !field.value &&
                                "text-muted-foreground text-zinc-500",
                              "cursor-not-allowed opacity-50",
                            )}
                          >
                            {field.value || "Aguardando IMEI..."}
                          </ButtonShadcn>
                        </FormControl>
                        <FormMessage />
                      </div>
                    </PopoverTrigger>
                  </Popover>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="operator_id"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col self-start md:w-fit">
                  <FormLabel className="flex w-fit items-start text-center text-lg">
                    Operadora do dispositivo
                  </FormLabel>

                  {/* Versão alternativa usando select nativo */}
                  <div className="relative w-full self-start md:w-fit">
                    <FormControl>
                      <select
                        {...field}
                        disabled={
                          !operatorsLoaded || operatorOptions.length === 0
                        }
                        className={cn(
                          "border-input h-10 w-full appearance-none rounded-md border bg-zinc-100 px-3 pr-10 text-sm shadow-sm md:w-96 md:text-base xl:w-[25.5rem]",
                          "focus:ring-ring focus:border-transparent focus:outline-none focus:ring-2",
                          !field.value && "text-muted-foreground text-zinc-500",
                          (!operatorsLoaded || operatorOptions.length === 0) &&
                            "cursor-not-allowed opacity-50",
                        )}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                        }}
                      >
                        <option value="" disabled>
                          {!operatorsLoaded
                            ? "Carregando operadoras..."
                            : operatorOptions.length === 0
                              ? "Nenhuma operadora disponível"
                              : "Selecione a operadora do dispositivo"}
                        </option>
                        {operatorOptions.map((operator) => (
                          <option key={operator.value} value={operator.value}>
                            {operator.label}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {device ? (
              <div className="flex w-full justify-between">
                {isPopover ? (
                  <DialogClose asChild>
                    <Button
                      onClick={() => setModalOpen!(false)}
                      type="button"
                      variant="white"
                      className="!w-60"
                    >
                      Cancelar
                    </Button>
                  </DialogClose>
                ) : (
                  <Link href={"/meus-dispositivos"}>
                    <Button
                      onClick={() => goBack()}
                      type="button"
                      variant="white"
                      className="!w-60"
                    >
                      Cancelar
                    </Button>
                  </Link>
                )}
                <Button
                  type="submit"
                  variant={userStatus === "Ativo" ? "blue" : "disabled"}
                  disabled={userStatus !== "Ativo"}
                  className="!w-60"
                >
                  Salvar alterações
                </Button>
              </div>
            ) : (
              <div className="flex w-full justify-between">
                {isPopover ? (
                  <Button
                    onClick={() => setModalOpen!(false)}
                    type="button"
                    variant="white"
                    className="!w-60"
                  >
                    Cancelar
                  </Button>
                ) : (
                  <Link href={"/meus-dispositivos"}>
                    <Button
                      onClick={() => goBack()}
                      type="button"
                      variant="white"
                      className="!w-60"
                    >
                      Cancelar
                    </Button>
                  </Link>
                )}
                <Button
                  type="submit"
                  variant={userStatus === "Ativo" ? "blue" : "disabled"}
                  disabled={userStatus !== "Ativo"}
                  className="!w-60"
                >
                  Cadastrar
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* Layout Mobile - nova estilização baseada na imagem */}
      <div className="block min-h-screen w-[95%] bg-gray-50 pb-20 md:hidden">
        <div className="bg-white">
          {/* Header */}
          <div className="border-b border-gray-200 px-4 py-4">
            <h1 className="text-lg font-medium text-gray-900">
              {device ? "Editar dispositivo" : "Cadastrar dispositivo"}
            </h1>
            {!device && (
              <p className="mt-1 text-sm text-gray-600">
                Insira os dados abaixo:
              </p>
            )}
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-4"
            >
              {/* IMEI Field */}
              <FormField
                control={form.control}
                name="imei"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      IMEI (obrigatório)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="12 345678 901234 5"
                          value={formatImei(field.value || "")}
                          maxLength={19} // 15 números + 4 espaços
                          className="h-12 rounded-lg border-gray-200 bg-gray-50 text-center font-mono text-base tracking-wider placeholder:text-gray-400"
                          onChange={(e) => {
                            const rawValue = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 15);
                            field.onChange(rawValue);
                          }}
                        />
                      </div>
                    </FormControl>

                    {/* Info Box */}
                    <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3">
                      <p className="flex items-start gap-2 text-xs text-cyan-800">
                        <span className="shrink-0 text-sm text-cyan-600">
                          ℹ
                        </span>
                        O IMEI é composto por 15 números e pode ser encontrado
                        na embalagem do aparelho ou digitando *#06# no teclado
                        do aparelho.
                      </p>
                    </div>

                    <FormMessage />
                    {imeiError && (
                      <p className="text-sm text-red-600">{imeiError}</p>
                    )}
                  </FormItem>
                )}
              />

              {/* Phone Number Field */}
              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Número do celular (obrigatório)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        value={formatPhone(field.value || "")}
                        maxLength={15} // (11) 99999-9999
                        className="h-12 rounded-lg border-gray-200 bg-gray-50 text-center font-mono text-base tracking-wide placeholder:text-gray-400"
                        onChange={(e) => {
                          const rawValue = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 11);
                          field.onChange(rawValue);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand Field */}
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Fabricante
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pesquise o fabricante do dispositivo"
                        {...field}
                        disabled
                        className="h-12 cursor-not-allowed rounded-lg border-gray-200 bg-gray-100 text-base placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Model Field */}
              <FormField
                control={form.control}
                name="phone_model"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Modelo
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Selecione o modelo do dispositivo"
                        {...field}
                        disabled
                        className="h-12 cursor-not-allowed rounded-lg border-gray-200 bg-gray-100 text-base placeholder:text-gray-400"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Operator Field */}
              <FormField
                control={form.control}
                name="operator_id"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Operadora
                    </FormLabel>

                    {/* Versão simplificada usando select nativo */}
                    <div className="relative">
                      <FormControl>
                        <select
                          {...field}
                          disabled={
                            !operatorsLoaded || operatorOptions.length === 0
                          }
                          className={cn(
                            "h-12 w-full appearance-none rounded-lg border-gray-200 bg-gray-50 px-3 pr-10 text-base",
                            "focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500",
                            !field.value && "text-gray-400",
                            (!operatorsLoaded ||
                              operatorOptions.length === 0) &&
                              "cursor-not-allowed opacity-50",
                          )}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                          }}
                        >
                          <option value="" disabled>
                            {!operatorsLoaded
                              ? "Carregando operadoras..."
                              : operatorOptions.length === 0
                                ? "Nenhuma operadora disponível"
                                : "Selecione a operadora"}
                          </option>
                          {operatorOptions.map((operator) => (
                            <option key={operator.value} value={operator.value}>
                              {operator.label}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex w-full justify-center gap-4 pt-6">
                {device ? (
                  <>
                    {isPopover ? (
                      <DialogClose asChild>
                        <Button
                          onClick={() => setModalOpen!(false)}
                          type="button"
                          variant="white"
                          className="w-28 md:w-40"
                        >
                          Cancelar
                        </Button>
                      </DialogClose>
                    ) : (
                      <Link href={"/meus-dispositivos"}>
                        <Button
                          onClick={() => goBack()}
                          type="button"
                          variant="white"
                          className="w-28 md:w-40"
                        >
                          Cancelar
                        </Button>
                      </Link>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      variant="blue"
                      className="w-28 md:w-40"
                    >
                      {isLoading ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </>
                ) : (
                  <>
                    {isPopover ? (
                      <Button
                        onClick={() => setModalOpen!(false)}
                        type="button"
                        variant="white"
                        className="w-28 md:w-40"
                      >
                        Cancelar
                      </Button>
                    ) : (
                      <Link href={"/meus-dispositivos"}>
                        <Button
                          onClick={() => goBack()}
                          type="button"
                          variant="white"
                          className="w-28 md:w-40"
                        >
                          Cancelar
                        </Button>
                      </Link>
                    )}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      variant="blue"
                      className="w-28 md:w-40"
                    >
                      {isLoading ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}

async function getOperatorOptions(): Promise<
  { label: string; value: string }[]
> {
  try {
    const operators = await listOperators();

    if (!operators || !Array.isArray(operators)) {
      throw new Error("Dados inválidos da API");
    }

    const mappedOperators = operators.map((operator: Operator) => ({
      label: operator.name_operator,
      value: operator.$id,
    }));

    return mappedOperators;
  } catch (error) {
    console.error("Erro ao buscar operadoras:", error);
    // Retornar algumas operadoras padrão caso haja erro
    return [
      { label: "Vivo", value: "vivo" },
      { label: "Claro", value: "claro" },
      { label: "TIM", value: "tim" },
      { label: "Oi", value: "oi" },
    ];
  }
}
