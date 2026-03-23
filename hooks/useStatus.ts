import { checkUserStatus } from "@/functions/user/check-user-status";
import { account } from "@/lib/appwrite";
import { useEffect, useState } from "react";

export function useStatus() {
  const [userStatus, setUserStatus] = useState<string>("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const user = await account.get();
        const userStatus = await checkUserStatus(user.$id);

        setUserStatus(userStatus.status);
      } catch (error) {
        console.error("Erro ao atualizar ocorrências:", error);
      }
    };

    fetchStatus();
  }, []);

  return { userStatus };
}
