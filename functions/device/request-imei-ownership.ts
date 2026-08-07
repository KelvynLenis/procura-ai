import { getUserById } from "../user/get-user-by-id";
import { getUserId } from "../user/get-user-id";
import { getDeviceByImei } from "./get-device-by-imei";

interface requestImeiOwnershipResponse {
  isValid: boolean;
  isError?: boolean;
  error?: string;
  deviceId?: string;
  status?: string;
}

export async function requestImeiOwnership(
  imei: string,
  brand?: string,
  model?: string,
): Promise<requestImeiOwnershipResponse> {
  try {
    const userId = await getUserId();
    const user = await getUserById(userId);

    const requestDeviceOwnershipResponse = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/request-device-ownership`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imei, newOwnerName: user.name }),
      },
    );

    const requestDeviceOwnership = await requestDeviceOwnershipResponse.json();

    if (requestDeviceOwnership.status !== "success") {
      return {
        isValid: false,
        isError: true,
        error:
          "Erro ao solicitar a transferência de proprietário. Por favor, tente novamente mais tarde.",
      };
    }

    return {
      isValid: true,
    };
  } catch (error) {
    console.error("Erro ao verificar IMEI:", error);
    return {
      isValid: false,
      isError: true,
      error: "Erro ao verificar IMEI. Por favor, tente novamente mais tarde.",
    };
  }
}
