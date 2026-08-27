import Button from "@/components/Button";
import { Checkbox } from "@/components/ui/checkbox";
import { Device, Transfer } from "@/types";
import { CircleAlert } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import successfullImage from "../../assets/images/transfer-successfull.svg";
import ClipLoader from "react-spinners/ClipLoader";
import failedImage from "../../assets/images/transfer-failed.svg";
import crypto from "crypto";

function ConfirmWrapper({ token }: { token: string }) {
  const [isSuccessfull, setIsSuccessfull] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [device, setDevice] = useState({} as Device);
  const [isUserAwareChecked, setisUserAwareChecked] = useState(false);
  const [isRequestMade, setIsRequestMade] = useState(false);
  const [transfer, setTransfer] = useState({} as Transfer);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [step, setStep] = useState(1);
  const [isSending, setIsSending] = useState(false);

  async function handleConfirmTransfer() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/confirm-ownership-transfer?token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      console.log(data);

      if (!data.success) {
        setErrorMessage(data.error);
        return;
      }

      const responsePushNotification = await fetch(
        "/api/send-transfer-push-notification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Transferencia de posse aceita",
            message: "Transferencia de posse concluida com sucesso",
            requesterId: transfer.requester_id,
          }),
        },
      );

      if (!responsePushNotification.ok) {
        console.error("Erro ao enviar notificação");
      }

      setHasAccepted(true);

      setDevice(data.device);
      setIsSuccessfull(data.success);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
      setIsSuccessfull(false);
    } finally {
      setIsRequestMade(true);
      setIsLoading(false);
    }
  }

  async function handleRefuseTransfer() {
    try {
      setIsLoading(true);
      const response = await fetch(
        `/api/refuse-ownership-transfer?token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (!data.success) {
        setErrorMessage(data.error);
        return;
      }

      const responsePushNotification = await fetch(
        "/api/send-transfer-push-notification",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Transferencia de posse recusada",
            message: "O proprietário recusou a transferencia de posse",
            requesterId: transfer.requester_id,
            ownerId: transfer.owner_id,
          }),
        },
      );

      if (!responsePushNotification.ok) {
        console.error("Erro ao enviar notificação");
      }

      setHasAccepted(false);

      setStep(2);

      setDevice(data.device);
      setIsSuccessfull(data.success);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message);
      setIsSuccessfull(false);
    } finally {
      setIsRequestMade(true);
      setIsLoading(false);
    }
  }

  const wasRequestMade = isRequestMade && isLoading;
  const wasAccepted = hasAccepted && isSuccessfull;

  useEffect(() => {
    async function getTransfer(token: string) {
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      const params = new URLSearchParams({
        "queries[0]": JSON.stringify({
          method: "equal",
          attribute: "token_hash",
          values: [tokenHash],
        }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_TRANSFER_TOKENS}/documents?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao validar token: ${error}`);
      }

      const { documents } = await response.json();
      const transfer = documents[0];

      setTransfer(transfer);
      setIsLoading(false);
    }

    getTransfer(token);
  }, []);

  return (
    <div className="flex w-full lg:h-screen lg:items-center lg:justify-center lg:bg-black/50">
      <div className="flex h-fit flex-col gap-4 rounded-lg bg-white p-4 lg:mt-4 lg:w-[80%] lg:max-w-[800px]">
        {step === 1 && (
          <>
            <h1 className="font-medium">
              Confirmar transferência do dispositivo
            </h1>

            <p>
              Ao continuar, o Galaxy A17 vai deixar de estar vinculado à sua
              conta.{" "}
            </p>
            <p>
              Isso significa que você não vai mais conseguir ter acesso a este
              dispositivo dentro do Procura.Aí e a proteção passa para o novo
              dono, assim que ele completar o cadastro.
            </p>

            <div className="w-full max-w-[320px] rounded-lg bg-[#C4F3F2] px-4 py-2 lg:max-w-full">
              <div className="flex items-center gap-2">
                <CircleAlert className="" />
                Atenção
              </div>
              Essa ação não pode ser desfeita. Se você não vendeu/doou este
              dispositivo, volte ao e-mail e escolha "Este dispositivo ainda é
              meu".
            </div>

            <div className="flex gap-2">
              <Checkbox
                checked={isUserAwareChecked}
                onCheckedChange={(checked) =>
                  setisUserAwareChecked(checked === true)
                }
                className="mt-1 shadow-none data-[state=checked]:bg-secondary"
              />
              Estou ciente que estou abrindo mão da propriedade deste
              dispositivo e não terei mais acesso ao cadastro dele.
            </div>

            <div className="mt-0 flex justify-between mobile:mt-20">
              <Button onClick={handleRefuseTransfer} variant="black">
                Cancelar
              </Button>
              <Button onClick={handleConfirmTransfer} variant="blue">
                Confirmar
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {isSuccessfull ? (
              <>
                {hasAccepted ? (
                  <>
                    <h1 className="font-medium">
                      Pronto! O dispositivo {device.phone_model} não está
                      cadastrado mais na sua conta
                    </h1>
                    <p className="text-sm font-medium">
                      Se isso foi um engano, por favor, acesse o Procura.Aí para
                      reivindicar a posse.
                    </p>

                    <Image
                      src={successfullImage}
                      alt="transferencia concluida com sucesso"
                      className="mt-20 self-center"
                    />
                  </>
                ) : (
                  <>
                    <h1 className="font-medium">
                      Reivindicação negada! O dispositivo {device.phone_model}{" "}
                      continua cadastrado em sua conta
                    </h1>
                    <p className="text-sm font-medium">
                      Já informamos em nosso sistema que este dispositivo
                      continua sob sua responsabilidade.
                    </p>

                    <Image
                      src={failedImage}
                      alt="transferencia concluida com sucesso"
                      className="mt-20 self-center"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-red-500">
                  Erro ao transferir o dispositivo: {errorMessage}
                </p>
              </>
            )}
          </>
        )}

        {/* {wasRequestMade ? (
          <ClipLoader color="#212A38" className="self-center" />
        ) : wasAccepted ? (
          <>
            <h1 className="font-medium">
              Pronto! O dispositivo {device.phone_model} não está cadastrado
              mais na sua conta
            </h1>
            <p className="text-sm font-medium">
              Se isso foi um engano, por favor, acesse o Procura.Aí para
              reivindicar a posse.
            </p>

            <Image
              src={successfullImage}
              alt="transferencia concluida com sucesso"
              className="mt-20 self-center"
            />
          </>
        ) : (
          <>
            <h1 className="font-medium">
              Reivindicação negada! O dispositivo {device.phone_model} continua
              cadastrado em sua conta
            </h1>
            <p className="text-sm font-medium">
              Já informamos em nosso sistema que este dispositivo continua sob
              sua responsabilidade.
            </p>

            <Image
              src={failedImage}
              alt="transferencia concluida com sucesso"
              className="mt-20 self-center"
            />
          </>
        )}

        {wasRequestMade && !isSuccessfull && (
          <p className="text-sm font-medium text-red-500">
            Erro ao transferir o dispositivo: {errorMessage}
          </p>
        )} */}
      </div>
    </div>
  );
}

export default ConfirmWrapper;
