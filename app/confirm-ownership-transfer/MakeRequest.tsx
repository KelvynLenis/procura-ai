import React from "react";
import { useEffect, useState } from "react";

function MakeRequest({ token }: { token: string }) {
  const [isSuccessfull, setIsSuccessfull] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

        console.log(data.success);
        setIsSuccessfull(data.success);
      } catch (error) {
        console.error("Erro:", error);
        setIsSuccessfull(false);
        setErrorMessage(error as string);
      }
    };

    sendRequest();
  }, []);
  return (
    <div className="text-xl text-white">
      {" "}
      {isSuccessfull
        ? "Seu dispositivo foi transferido com sucesso"
        : "Ocorreu um erro ao transferir o dispositivo"}
      {!isSuccessfull && errorMessage}
    </div>
  );
}

export default MakeRequest;
