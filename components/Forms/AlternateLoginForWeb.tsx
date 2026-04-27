import Button from "../Button";
import { useState } from "react";
import { formatEmail, validateCPF } from "@/lib/utils";
import { getUserByCPF } from "@/functions/user/get-user-by-cpf";
import { sendVerificationCode } from "@/functions/verification/send-verification-code";
import { validateVerificationCode } from "@/functions/verification/validate-verification-code";
import { createSessionFromToken } from "@/functions/auth/create-session-from-token";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../ui/input-otp";
import { toast } from "react-toastify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import verifyEmail from "../../assets/images/verify-email.svg";
import codeSent from "../../assets/images/code-sent.svg";
import { CircleAlert } from "lucide-react";

export function AlternateLoginForWeb({
  setIsAlternateLogin,
}: {
  setIsAlternateLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [step, setStep] = useState(1);
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

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

      if (!result.userId || !result.sessionSecret) {
        throw new Error("Nao foi possivel autenticar o usuario");
      }

      await createSessionFromToken(result.userId, result.sessionSecret);

      toast.success("Código validado com sucesso");
      router.push("/meus-dispositivos");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao validar código");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePreviousButton() {
    if (step === 1) {
      setIsAlternateLogin(false);
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
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
      <div className="hidden w-96 flex-col md:flex">
        <StepOne step={step} cpf={cpf} setCpf={setCpf} />
        <StepTwo step={step} maskedEmail={maskedEmail} />
        <StepThree
          step={step}
          maskedEmail={maskedEmail}
          code={code}
          setCode={setCode}
          onResendCode={handleSendCode}
          isSubmitting={isSubmitting}
        />
        <div className="mt-4 flex w-full flex-row justify-between">
          <div>
            <Button
              variant="white"
              onClick={handlePreviousButton}
              className="!text-sm"
              type="button"
            >
              Voltar
            </Button>
          </div>
          <Button
            variant="blue"
            onClick={handleNextButton}
            className="!text-sm"
            type="submit"
            disabled={isSubmitting}
          >
            {step === 1 && "Avançar"}
            {step === 2 && "Enviar Código"}
            {step === 3 && "Validar Código"}
          </Button>
        </div>
      </div>
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
      <div className="mb-12 mt-2 flex flex-col justify-between gap-0 px-0 duration-700 animate-in fade-in-5">
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
              className="flex w-full items-center justify-center"
              value={cpf}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                }
              }}
              onChange={(e) => setCpf(e)}
            >
              <InputOTPGroup>
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={0}
                />
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={1}
                />
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={2}
                />
              </InputOTPGroup>
              <InputOTPSeparator className="relative -bottom-2" />
              <InputOTPGroup>
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={3}
                />
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={4}
                />
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={5}
                />
              </InputOTPGroup>
              <InputOTPSeparator className="relative -bottom-2" />
              <InputOTPGroup>
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={6}
                />
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={7}
                />
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={8}
                />
              </InputOTPGroup>
              <InputOTPSeparator data-dash />
              <InputOTPGroup>
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
                  index={9}
                />
                <InputOTPSlot
                  className="h-5 w-6 border-0 border-none shadow-transparent"
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

function StepTwo({ step, maskedEmail }: { step: number; maskedEmail: string }) {
  const displayEmail = maskedEmail || "********abcd@gmail.com";

  return (
    step === 2 && (
      <div className="mb-2 mt-2 flex flex-col justify-between gap-0 px-6 duration-700 animate-in fade-in-5">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-lg font-bold">Verificação de e-mail</span>
          <span className="text-center">
            Para confirmar que realmente é você, vamos enviar um código de
            verificação para o e-mail {displayEmail}
          </span>

          <Image src={verifyEmail} alt="verificar email" className="mt-4" />
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
      <div className="mb-2 mt-2 flex flex-col justify-between gap-0 duration-700 animate-in fade-in-5">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-lg font-bold">Código enviado</span>
          <span className="text-center">
            Digite o código de 6 dígitos enviado para o e-mail {displayEmail}
          </span>

          <div className="flex w-full flex-col items-center">
            <Image
              src={codeSent}
              alt="codigo enviado com sucesso"
              className="mt-0"
            />
            <div className="flex w-full flex-col items-center justify-center gap-2">
              <div className="w-full">
                <InputOTP
                  maxLength={6}
                  containerClassName=""
                  className="flex w-full"
                  value={code}
                  onChange={(e) => setCode(e)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot
                      className="-ml-2.5 mr-2.5 h-14 w-14 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300"
                      index={0}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-14 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300"
                      index={1}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-14 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300"
                      index={2}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-14 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300"
                      index={3}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-14 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300"
                      index={4}
                    />
                    <InputOTPSlot
                      className="mr-2.5 h-14 w-14 rounded-lg text-lg shadow-transparent ring-1 ring-zinc-300"
                      index={5}
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <button
                type="button"
                className="self-center text-sm underline"
                onClick={onResendCode}
                disabled={isSubmitting}
              >
                Reenviar código
              </button>

              <div className="mt-0 flex w-full flex-col self-start rounded-lg bg-[#C4F3F2] px-4 py-2 text-justify text-sm">
                <span className="self-center">
                  <CircleAlert className="mr-2 inline-block" />
                  Atenção
                </span>
                Este código tem validade de 5 minutos. Verifique a sua caixa de
                Spam. Este código é secreto, não compartilhe.
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  );
}
