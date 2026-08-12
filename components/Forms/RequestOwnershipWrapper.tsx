import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Button from "../Button";
import { Modal } from "../Modal";
import { requestImeiOwnership } from "@/functions/device/request-imei-ownership";
import Image from "next/image";
import { CircleX, Sparkles, TriangleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import transfer from "../../assets/icons/transfer.svg";
import transferSuccessful from "../../assets/icons/transfer-successful.svg";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { toast } from "react-toastify";
import { getDeviceByImei } from "@/functions/device/get-device-by-imei";
import { useRouter } from "next/navigation";

interface RequestOwnershipDrawerProps {
  isOpen: boolean;
  isMobile: boolean;
  imei: string;
  onClose: () => void;
  onFinish: (result: { successfull: boolean }) => void;
}

export default function RequestOwnershipWrapper({
  isOpen,
  isMobile,
  imei,
  onClose,
  onFinish,
}: RequestOwnershipDrawerProps) {
  const snapPoints = useMemo(() => ["60%", "80%", "100%"], []);
  const [step, setStep] = useState(1);
  const [isDeviceValid, setIsDeviceValid] = useState(false);
  const [reasonItIsNotValid, setReasonItIsNotValid] = useState("");

  function handleClose() {}

  return (
    <>
      <Dialog open={isOpen && !isMobile}>
        {/* <DialogTrigger>Open</DialogTrigger> */}
        <DialogContent canClose={false} className="flex w-[569px] flex-col p-1">
          {step === 1 && <StepOne setStep={setStep} onClose={onClose} />}
          {step === 2 && (
            <StepTwo
              setStep={setStep}
              imeiArg={imei}
              setIsDeviceValid={setIsDeviceValid}
              setReasonItIsNotValid={setReasonItIsNotValid}
              onFinish={onFinish}
            />
          )}
          {step === 3 && (
            <StepThree
              isDeviceValid={isDeviceValid}
              reasonItIsNotValid={reasonItIsNotValid}
              imei={imei}
              setStep={setStep}
              onClose={onClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Step 1 ──────────────────────────────────────────────────────
const StepOne = React.memo(function StepOne({
  setStep,
  onClose,
}: {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}) {
  const [localCpf, setLocalCpf] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAdvance() {
    setStep(2);
  }

  return (
    <div className="mb-4 mt-2 flex flex-col justify-between gap-4 px-6">
      <div className="flex w-full flex-col items-center justify-center">
        <CircleX color={"#ef4444"} size={40} className="self-center" />
        <p className="mb-2 text-center text-xl font-bold text-red-500">
          Este dispositivo já está cadastrado no Procura.Aí
        </p>

        <div className="flex w-full flex-col gap-4">
          <p className="text-base">
            O IMEI enviado já está cadastrado no nosso sistema. O que você pode
            fazer:
          </p>
          <div className="ml-4 flex gap-2 text-base">
            <Sparkles
              size={15}
              className="w-3 self-center"
              fill="#0B7AF5"
              color="#0B7AF5"
            />
            <p>Verifique se digitou corretamente toda a numeração</p>
          </div>

          <div className="ml-4 flex gap-2 text-base">
            <Sparkles
              className="w-3 self-center"
              fill="#0B7AF5"
              color="#0B7AF5"
            />
            <p className="w-[80%]">
              Se você recebeu este dispositivo de outra pessoa e ela não excluiu
              o dispositivo da própria conta. Reinvidique a posse
            </p>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-row justify-between">
        <Button
          className="w-52"
          variant="black"
          onClick={onClose}
          disabled={isLoading}
        >
          <p className="font-medium">Cancelar</p>
        </Button>
        <Button
          className="w-52"
          variant="blue"
          onClick={handleAdvance}
          disabled={isLoading}
        >
          <p className="font-medium">Reinvidicar posse</p>
        </Button>
      </div>
    </div>
  );
});

// ─── Step 2 ─────────────────────────────────────────────────
const StepTwo = React.memo(function StepTwo({
  setStep,
  imeiArg,
  setIsDeviceValid,
  setReasonItIsNotValid,
  onFinish,
}: {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  imeiArg: string;
  setIsDeviceValid: React.Dispatch<React.SetStateAction<boolean>>;
  setReasonItIsNotValid: React.Dispatch<React.SetStateAction<string>>;
  onFinish: (result: { successfull: boolean }) => void;
}) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [imei, setImei] = useState(imeiArg);

  async function handleSubmitIMEI() {
    const existingDevice = await getDeviceByImei(imei);

    if (existingDevice.length > 1) {
      setIsDeviceValid(false);
      setReasonItIsNotValid("duplicado");
      onFinish({ successfull: false });

      return;
    }

    if (
      existingDevice[0].status === "Roubado" ||
      existingDevice[0].status === "Furtado" ||
      existingDevice[0].status === "Perdido"
    ) {
      setIsDeviceValid(false);
      setReasonItIsNotValid(
        "Atenção! Este dispositivo está notificado como roubado, furtado ou perdido.",
      );

      onFinish({ successfull: false });

      setStep(3);

      return;
    }

    setIsDeviceValid(true);

    onFinish({ successfull: true });

    setStep(3);
  }

  return (
    <div className="mb-4 flex flex-col justify-between gap-4 px-6">
      <div className="flex w-full flex-col items-center">
        <Image src={transfer} alt="hand" className="mt-2" />
        <p className="mb-2 text-lg font-bold">Reinvidicação de posse</p>
        <p className="w-full">
          Se este dispositivo é realmente seu e você deseja cadastra-lo na sua
          conta, confirme o IMEI para reivindicar a posse.
        </p>

        <div className="mt-5 flex w-full flex-col">
          <p className="font-bold text-primary">IMEI</p>
          <InputOTP
            value={imei}
            onChange={setImei}
            maxLength={15}
            className="flex h-full w-full items-center justify-center"
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
        </div>
        {error ? (
          <p className="mt-3 text-center text-sm text-red-500">{error}</p>
        ) : null}
      </div>

      <p>
        O antigo dono do dispositivo será contactado e logo após a confirmação
        da venda ou doação do dispositivo, a posse será transferida para você.
      </p>

      <div className="flex w-full flex-row justify-between">
        <Button variant="black" onClick={() => setStep(1)} disabled={isSending}>
          <p className="font-medium">Cancelar</p>
        </Button>
        <Button variant="blue" onClick={handleSubmitIMEI} disabled={isSending}>
          <p className="font-medium">
            {isSending ? "Enviando..." : "Confirmar"}
          </p>
        </Button>
      </div>
    </div>
  );
});

// ─── Step 3 ───────────────────────────────────────────────────
const StepThree = React.memo(function StepThree({
  isDeviceValid,
  reasonItIsNotValid,
  imei,
  setStep,
  onClose,
}: {
  isDeviceValid: boolean;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  imei: string;
  reasonItIsNotValid: string;
  onClose: () => void;
}) {
  const [error, setError] = useState("");
  const [deviceStatus, setDeviceStatus] = useState("");
  const router = useRouter();

  function handleClose() {
    onClose();

    router.push("/meus-dispositivos");
  }

  useEffect(() => {
    const fetchDeviceStatus = async () => {
      try {
        const devices = await getDeviceByImei(imei);
        const device = devices[0];

        setDeviceStatus(device.status);
      } catch (error) {
        console.error("Erro ao atualizar ocorrências:", error);
      }
    };

    fetchDeviceStatus();
  }, []);

  return (
    <div className="mb-4 mt-2 flex flex-col items-center justify-between px-6">
      {isDeviceValid ? (
        <>
          <p className="mb-2 text-center text-xl font-bold">
            Reinvidicação de posse solicitada
          </p>
          <p className="text-center">
            A sua reinvidicação de posse foi solicitada. Assim que o processo
            for concluído entraremos em contato através do seu e-mail e pelo
            aplicativo do Procura.Aí
          </p>

          <Image
            src={transferSuccessful}
            alt="request-ownership"
            className="mt-2 self-center"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-4">
          <TriangleAlert size={60} color="white" fill="#ef4444" />
          <p className="mb-2 w-[20rem] text-center text-xl font-semibold text-red-500">
            {reasonItIsNotValid === "duplicado"
              ? "Este dispositivo ja foi solicitado por outra pessoa."
              : `Atenção! Este dispositivo está notificado como ${deviceStatus}.`}
          </p>
          <div>
            {reasonItIsNotValid === "duplicado" ? (
              "Este dispositivo ja foi solicitado por outra pessoa."
            ) : (
              <p>
                O dispositivo com o IMEI <strong> {imei} </strong> está
                cadastrado em nosso sistema como{" "}
                <strong className="font-bold">{deviceStatus}</strong>
              </p>
            )}
          </div>

          <div>
            {reasonItIsNotValid === "duplicado" ? (
              "Este dispositivo ja foi solicitado por outra pessoa."
            ) : (
              <div>
                Se você comprou ou encontrou este dispositivo, dirija-se a
                delegacia para fazer a{" "}
                <strong className="font-bold"> devolução voluntária.</strong>
              </div>
            )}
          </div>

          {reasonItIsNotValid !== "duplicado" && (
            <p>
              Leve o celular, a caixa (se a tiver) e todas as conversas,
              comprovantes de pagamento ou dados de quem lhe vendeu o aparelho.
            </p>
          )}

          <Button className="mt-2 self-start" onClick={onClose} variant="black">
            Voltar
          </Button>
        </div>
      )}

      <div className="flex w-full flex-row items-center justify-center">
        <Button variant="black" onClick={handleClose}>
          Fechar
        </Button>
        {/* <Button variant="blue">Confirmar</Button> */}
      </div>
    </div>
  );
});
