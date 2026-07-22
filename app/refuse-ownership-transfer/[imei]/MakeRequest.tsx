import React from "react";
import { useEffect, useState } from "react";

interface Params {
  imei: string;
}

function MakeRequest({ imei }: Params) {
  const [isSuccessfull, setIsSuccessfull] = useState(false);

  useEffect(() => {
    const sendRequest = async () => {
      try {
        const response = await fetch(`/api/refuse-ownership-transfer/${imei}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        console.log(data.success);
      } catch (error) {
        console.error("Erro:", error);
      }
    };

    sendRequest();
  }, []);
  return (
    <div className="text-xl text-white">
      {" "}
      Seu dispositivo foi transferido com sucesso
    </div>
  );
}

export default MakeRequest;
