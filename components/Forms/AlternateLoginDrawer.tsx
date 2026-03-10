import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Button from "../Button";
import { useEffect, useState } from "react";
import { formatEmail, validateCPF } from "@/lib/utils";
import { getUserByCPF } from "@/functions/user/get-user-by-cpf";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../ui/input-otp";
import { toast } from "react-toastify";
import Image from "next/image";
import verifyEmail from "../../assets/images/verify-email.svg";
import codeSent from "../../assets/images/code-sent.svg";

export function AlternateLoginDrawer() {
  const [step, setStep] = useState(1);
  const [cpf, setCpf] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  function handleCloseDrawer() {
    setIsOpen(false);
  }

  function handleValidateCPF() {
    const isValid = validateCPF(cpf);

    if (isValid) {
      setStep(2);
    } else {
      toast.error("CPF inválido");
    }
  }

  function handlePreviousButton() {
    if (step === 1) {
      handleCloseDrawer();
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    }
  }

  function handleNextButton() {
    if (step === 1) {
      handleValidateCPF();
    } else if (step === 2) {
      setStep(3);
    }
  }

  return (
    <>
      <Drawer open={isOpen}>
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
        <DrawerContent className="flex bg-white">
          <StepOne
            step={step}
            setStep={setStep}
            cpf={cpf}
            setCpf={setCpf}
            onClose={handleCloseDrawer}
          />
          <StepTwo step={step} setStep={setStep} cpf={cpf} />
          <StepThree step={step} setStep={setStep} cpf={cpf} setCpf={setCpf} />
          <DrawerFooter className="flex w-full flex-row justify-between">
            <DrawerClose>
              <Button variant="white" onClick={handlePreviousButton}>
                Cancel
              </Button>
            </DrawerClose>
            <Button variant="blue" onClick={handleNextButton}>
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
  setStep,
  cpf,
  setCpf,
  onClose,
}: {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setCpf: React.Dispatch<React.SetStateAction<string>>;
  cpf: string;
  onClose: () => void;
}) {
  function handleValidateCPF() {
    const isValid = validateCPF(cpf);

    if (isValid) {
      setStep(2);
    } else {
      toast.error("CPF inválido");
    }
  }

  return (
    step === 1 && (
      <div className="mb-2 mt-2 flex h-[22rem] w-screen flex-col justify-between gap-0 px-6 duration-700 animate-in slide-in-from-left">
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
  setStep,
  cpf,
}: {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  cpf: string;
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!cpf) return;
    const getUserEmail = async () => {
      if (step !== 2) return;

      const { email } = await getUserByCPF(cpf);

      const formattedEmail = formatEmail(email);

      setEmail(formattedEmail);
      setIsLoading(false);
    };

    getUserEmail();
  }, [step]);

  return (
    step === 2 && (
      <div className="mb-2 mt-2 flex h-[22rem] w-screen flex-col justify-between gap-0 px-6 duration-700 animate-in slide-in-from-left">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-lg font-bold">Verificação de e-mail</span>
          <span className="text-center">
            Para confirmar que realmente é você, vamos enviar um código de
            verificação para o e-mail{" "}
            {isLoading ? "********abcd@gmail.com" : email}
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
  setStep,
  cpf,
  setCpf,
}: {
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setCpf: React.Dispatch<React.SetStateAction<string>>;
  cpf: string;
}) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!cpf) return;
    const getUserEmail = async () => {
      const { email } = await getUserByCPF(cpf);

      const formattedEmail = formatEmail(email);

      setEmail(formattedEmail);
      setIsLoading(false);
    };

    getUserEmail();
  }, [cpf]);

  return (
    step === 3 && (
      <div className="mb-2 mt-2 flex h-[36rem] w-screen flex-col justify-between gap-0 px-6 duration-700 animate-in slide-in-from-left">
        <div className="flex flex-col items-center">
          <span className="mb-2 text-lg font-bold">Código enviado</span>
          <span className="text-center">
            Digite o código de 6 dígitos enviado para o e-mail{" "}
            {isLoading ? "********abcd@gmail.com" : email}
          </span>

          <div className="flex w-full flex-col items-center gap-2">
            <Image
              src={codeSent}
              alt="codigo enviado com sucesso"
              className="mt-4"
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

              <span className="self-start">Reenviar código</span>

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
