import React from "react";
import { useEffect, useState } from "react";

function MakeRequest({ token }: { token: string }) {
  const [isSuccessfull, setIsSuccessfull] = useState(false);

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
        console.log(data.success);
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    sendRequest();
  }, []);
  return (
    <div className="text-xl text-white"> Solicitação negada com sucesso</div>
  );
}

export default MakeRequest;
