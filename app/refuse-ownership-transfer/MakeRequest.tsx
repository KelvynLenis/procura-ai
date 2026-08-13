"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import failedImage from "../../assets/images/transfer-failed.svg";
import ClipLoader from "react-spinners/ClipLoader";
import { Device } from "@/types";

function MakeRequest({ token }: { token: string }) {
  const [isSuccessfull, setIsSuccessfull] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [device, setDevice] = useState({} as Device);

  useEffect(() => {
    const sendRequest = async () => {
      try {
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
    <div className="flex flex-col gap-2 px-3 py-6">
      {isLoading ? (
        <ClipLoader color="#212A38" className="self-center" />
      ) : isSuccessfull ? (
        <>
          <h1 className="font-medium">
            Reivindicação negada! O dispositivo {device.phone_model} continua
            cadastrado em sua conta
          </h1>
          <p className="text-sm font-medium">
            Já informamos em nosso sistema que este dispositivo continua sob sua
            responsabilidade.
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
  );
}

export default MakeRequest;
