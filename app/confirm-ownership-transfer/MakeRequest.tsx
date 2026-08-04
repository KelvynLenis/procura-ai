"use client";

import Image from "next/image";
import React from "react";
import { useEffect, useState } from "react";

import successfullImage from "../../assets/images/transfer-successfull.svg";
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
            Pronto! O dispositivo {device.phone_model} não está cadastrado mais
            na sua conta
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
            Erro ao transferir o dispositivo: {errorMessage}
          </h1>
        </>
      )}
    </div>
  );
}

export default MakeRequest;
