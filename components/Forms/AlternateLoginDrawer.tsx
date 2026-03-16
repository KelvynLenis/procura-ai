import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Button from "../Button";
import { useState } from "react";
import { formatEmail, validateCPF } from "@/lib/utils";
import { getUserByCPF } from "@/functions/user/get-user-by-cpf";
import { sendVerificationCode } from "@/functions/verification/send-verification-code";
import { validateVerificationCode } from "@/functions/verification/validate-verification-code";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../ui/input-otp";
import { toast } from "react-toastify";
import Image from "next/image";
import verifyEmail from "../../assets/images/verify-email.png";
import codeSent from "../../assets/images/code-sent.png";

export function AlternateLoginDrawer() {
  const [step, setStep] = useState(1);
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [code, setCode] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleCloseDrawer() {
    setIsOpen(false);
    setStep(1);
    setCpf("");
    setEmail("");
    setMaskedEmail("");
    setUserId("");
    setUserName("");
    setCode("");
  }

  async function handleValidateCPF() {
    const isValid = validateCPF(cpf);

    if (!isValid) {
      toast.error("CPF inválido");
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await getUserByCPF(cpf);

      if (!user?.email || !user?.user_id) {
        throw new Error("CPF nao encontrado");
      }

      setEmail(user.email);
      setMaskedEmail(formatEmail(user.email));
      setUserId(user.user_id);
      setUserName(user.name ?? "");
      setStep(2);
    } catch (error: any) {
      toast.error(error?.message || "CPF não encontrado");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePreviousButton() {
    if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  }

  async function handleSendCode() {
    if (!email || !userId) {
      toast.error("Valide o CPF antes de continuar");
      return;
    }

    try {
      setIsSubmitting(true);
      await sendVerificationCode(email, userId, userName);
      setStep(3);
      toast.success("Código enviado com sucesso");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao enviar código");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleValidateCode() {
    if (code.length !== 6) {
      toast.error("Digite o código de 6 dígitos");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await validateVerificationCode(email, code);

      if (!result.success) {
        toast.error(result.message || "Código inválido");
        return;
      }

      toast.success("Código validado com sucesso");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao validar código");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleNextButton() {
    if (step === 1) {
      await handleValidateCPF();
      return;
    }

    if (step === 2) {
      await handleSendCode();
      return;
    }

    if (step === 3) {
      await handleValidateCode();
    }
  }

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <span className="mt-4 bg-[#FAFAFA] px-5 text-center md:hidden">
          Perdeu o acesso à sua conta gov.br?
          <DrawerTrigger
            className="text-secondary underline"
            onClick={() => setIsOpen(true)}
          >
            Acesse a versão limitada
          </DrawerTrigger>{" "}
          do Procura.Aí apenas com seu e-mail.
        </span>
        <DrawerContent className="mx-auto flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white md:max-w-md">
          <div className="flex items-center justify-center bg-white pb-1 pt-1.5">
            <div className="h-1 w-10 rounded-full bg-zinc-300/80" />
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-2 pt-1">
            <StepOne
              step={step}
              cpf={cpf}
              setCpf={setCpf}
            />
            <StepTwo step={step} maskedEmail={maskedEmail} />
            <StepThree
              step={step}
              maskedEmail={maskedEmail}
              code={code}
              setCode={setCode}
              onResendCode={handleSendCode}
              isSubmitting={isSubmitting}
            />
          </div>
          <DrawerFooter className="flex w-full flex-row justify-between gap-3 border-t bg-white px-4 py-3">
            <Button variant="white" onClick={handlePreviousButton}>
              Voltar
            </Button>
            <Button
              variant="blue"
              onClick={handleNextButton}
              disabled={isSubmitting}
            >
              {step === 1 && "Avançar"}
              {step === 2 && "Enviar Código"}
              {step === 3 && "Validar Código"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function StepOne({
  step,
  cpf,
  setCpf,
}: {
  step: number;
  setCpf: React.Dispatch<React.SetStateAction<string>>;
  cpf: string;
}) {
  return (
    step === 1 && (
      <div className="mb-2 mt-2 flex h-[22rem] w-full flex-col justify-between gap-0 duration-700 animate-in slide-in-from-left">
        <div className="flex flex-col items-center justify-center">
          <h1 className="mb-2 text-lg font-bold">
            Acesso limitado ao Procura.Aí
          </h1>
          <p className="text-center">
            Para acessar ao Procura.Aí através do e-mail, insira o seu CPF
          </p>

          <div className="mb-2 w-full">
            <span className="text-sm">CPF</span>
            <InputOTP
              maxLength={11}
              containerClassName="ring-1 ring-zinc-400"
              className="flex w-full items-center justify-center overflow-x-auto"
              value={cpf}
              onChange={(e) => setCpf(e)}
            >
              <InputOTPGroup>
                <InputOTPSlot
                  className="ml-2.5 h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={0}
                />
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={1}
                />
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={2}
                />
              </InputOTPGroup>
              <InputOTPSeparator className="relative -bottom-2" />
              <InputOTPGroup>
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={3}
                />
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={4}
                />
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={5}
                />
              </InputOTPGroup>
              <InputOTPSeparator className="relative -bottom-2" />
              <InputOTPGroup>
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={6}
                />
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={7}
                />
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={8}
                />
              </InputOTPGroup>
              <InputOTPSeparator data-dash />
              <InputOTPGroup>
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={9}
                />
                <InputOTPSlot
                  className="h-5 w-10 border-0 border-none shadow-transparent mobile:w-4"
                  index={10}
                />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* <div className="flex w-full justify-between">
          <Button variant="white" onClick={onClose}>
            Voltar
          </Button>
          <Button variant="blue" onClick={handleValidateCPF}>
            Avançar
          </Button>
        </div> */}
      </div>
    )
  );
}

function StepTwo({
  step,
  maskedEmail,
}: {
  step: number;
  maskedEmail: string;
}) {
  const displayEmail = maskedEmail || "********abcd@gmail.com";

  return (
    step === 2 && (
      <div className="mb-2 mt-2 flex h-[22rem] w-full flex-col justify-between gap-0 duration-700 animate-in slide-in-from-left">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-lg font-bold">Verificação de e-mail</span>
          <span className="text-center">
            Para confirmar que realmente é você, vamos enviar um código de
            verificação para o e-mail{" "}
            {displayEmail}
          </span>

          <Image
            src={verifyEmail}
            alt="verificar email"
            className="mt-4 h-auto w-full max-w-[15rem]"
            priority
          />
        </div>

        {/* <div className="flex w-full flex-row justify-between">
          <Button variant="white" onClick={() => setStep(1)}>
            Cancelar
          </Button>
          <Button variant="blue" onClick={() => setStep(3)}>
            Enviar Código
          </Button>
        </div> */}
      </div>
    )
  );
}

function StepThree({
  step,
  maskedEmail,
  code,
  setCode,
  onResendCode,
  isSubmitting,
}: {
  step: number;
  maskedEmail: string;
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  onResendCode: () => Promise<void>;
  isSubmitting: boolean;
}) {
  const displayEmail = maskedEmail || "********abcd@gmail.com";

  return (
    step === 3 && (
      <div className="mb-2 mt-2 flex min-h-[20rem] w-full flex-col justify-between gap-0 duration-700 animate-in slide-in-from-left">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-lg font-bold">Código enviado</span>
          <span className="text-center">
            Digite o código de 6 dígitos enviado para o e-mail{" "}
            {displayEmail}
          </span>

          <div className="flex w-full flex-col items-center gap-2">
            <Image
              src={codeSent}
              alt="codigo enviado com sucesso"
              className="mt-4 h-auto w-full max-w-[15rem]"
              priority
            />
            <div className="mb-6 w-full gap-2 self-start">
              <div className="mb-2 w-full">
                <InputOTP
                  maxLength={6}
                  containerClassName=""
                  className="flex w-full"
                  value={code}
                  onChange={(e) => setCode(e)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      className="-ml-2 mr-2.5 h-14 w-9 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300 mobile:-ml-1 mobile:w-11 mobile:text-2xl mobile-lg:-ml-4 mobile-lg:h-16 mobile-lg:w-14"
                      index={0}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-9 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300 mobile:w-11 mobile:text-2xl mobile-lg:h-16 mobile-lg:w-14"
                      index={1}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-9 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300 mobile:w-11 mobile:text-2xl mobile-lg:h-16 mobile-lg:w-14"
                      index={2}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-9 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300 mobile:w-11 mobile:text-2xl mobile-lg:h-16 mobile-lg:w-14"
                      index={3}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-9 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300 mobile:w-11 mobile:text-2xl mobile-lg:h-16 mobile-lg:w-14"
                      index={4}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-9 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300 mobile:w-11 mobile:text-2xl mobile-lg:h-16 mobile-lg:w-14"
                      index={5}
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <button
                className="self-start text-secondary underline"
                type="button"
                onClick={onResendCode}
                disabled={isSubmitting}
              >
                Reenviar código
              </button>

              <div className="mt-5 flex w-full flex-col self-start rounded-lg bg-[#C4F3F2] px-4 py-2">
                <span>
                  Atenção <br />
                  Este código tem validade de 5 minutos. <br />
                  Verifique a sua caixa de Spam. <br />
                  Este código é secreto, não compartilhe.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* <div className="flex w-full justify-between">
          <Button variant="white" onClick={() => setStep(2)}>
            Voltar
          </Button>
          <Button variant="blue">Validar Código</Button>
        </div> */}
      </div>
    )
  );
}
