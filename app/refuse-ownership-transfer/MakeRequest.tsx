"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import crypto from "crypto";

import failedImage from "../../assets/images/transfer-failed.svg";
import ClipLoader from "react-spinners/ClipLoader";
import { Device, Transfer } from "@/types";

function MakeRequest({ token }: { token: string }) {
  const [isSuccessfull, setIsSuccessfull] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [device, setDevice] = useState({} as Device);

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

    return transfer;
  }

  useEffect(() => {
    const sendRequest = async () => {
      try {
        const transfer = await getTransfer(token);

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

        setDevice(data.device);
        setIsSuccessfull(data.success);
      } catch (error) {
        console.error(error);
        setErrorMessage(error.message);
        setIsSuccessfull(false);
      } finally {
        setIsLoading(false);
      }
    };

    sendRequest();
  }, []);

  return (
    <div className="flex w-full lg:h-screen lg:items-center lg:justify-center lg:bg-black/50">
      <div className="flex h-fit flex-col gap-4 rounded-lg bg-white p-4 lg:mt-4 lg:w-[80%] lg:max-w-[800px]">
        {isLoading ? (
          <ClipLoader color="#212A38" className="self-center" />
        ) : isSuccessfull ? (
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
        ) : (
          <>
            <h1 className="font-medium">
              Erro ao transferir o dispositivo: {errorMessage}
            </h1>
          </>
        )}
      </div>
    </div>
  );
}

export default MakeRequest;
