import type { Device } from "@/types";
import { getDeviceByImei } from "./get-device-by-imei";
import { getUserId } from "../user/get-user-id";

interface ImeiCheckResponse {
  status: string;
  result: string;
  imei: string;
  count_free_checks_today: number;
  readPerformance: string;
  object: {
    brand: string;
    name: string;
    model: string;
  };
}

interface ImeiValidationResult {
  isValid: boolean;
  alreadyRegistered?: boolean;
  isTheUserTryingToRegisterADeviceHeAlreadyOwns?: boolean;
  error?: string;
  brand?: string;
  model?: string;
  name?: string;
  isUpdate?: boolean;
  deviceId?: string;
}

async function validateImeiWithExternalApi(
  imei: string,
  brand: string,
  model: string,
): Promise<ImeiValidationResult> {
  try {
    const response = await fetch(`/api/check-imei-info?imei=${imei}`);

    if (!response.ok) {
      console.error("Erro ao validar IMEI com API externa");
      return {
        isValid: false,
        error:
          "Não foi possível validar o IMEI no momento. Por favor, tente novamente mais tarde.",
      };
    }

    const data: ImeiCheckResponse = await response.json();

    if (data.status !== "succes") {
      console.error("API retornou status inválido");
      return {
        isValid: false,
        error:
          "Não foi possível validar o IMEI no momento. Por favor, tente novamente mais tarde.",
      };
    }

    const normalizedBrand = brand.toLowerCase().trim();
    const normalizedApiBrand = data.object.brand.toLowerCase().trim();

    if (normalizedBrand !== normalizedApiBrand) {
      console.error(
        `O Fabricante informado (${brand}) não corresponde ao IMEI (${data.object.brand})`,
      );
      return {
        isValid: false,
        error: "O Fabricante informado não corresponde ao IMEI.",
      };
    }

    const normalizedModel = model.toLowerCase().trim();
    const normalizedApiModel = data.object.name.toLowerCase().trim();
    const normalizedApiModelNumber = data.object.model.toLowerCase().trim();

    const modelMatches =
      normalizedModel.includes(normalizedApiModel) ||
      normalizedApiModel.includes(normalizedModel) ||
      normalizedModel.includes(normalizedApiModelNumber) ||
      normalizedApiModelNumber.includes(normalizedModel);

    if (!modelMatches) {
      console.error(
        `Modelo informado (${model}) não corresponde ao IMEI (${data.object.name} / ${data.object.model})`,
      );
      return {
        isValid: false,
        error: "O modelo informado não corresponde ao IMEI.",
      };
    }

    console.log("IMEI validado com sucesso:", {
      informado: { fabricante: brand, modelo: model },
      api: {
        fabricante: data.object.brand,
        modelo: data.object.name,
        modelNumber: data.object.model,
      },
    });

    return { isValid: true };
  } catch (error) {
    console.error("Erro ao validar IMEI:", error);
    return {
      isValid: false,
      error:
        "Não foi possível validar o IMEI no momento. Por favor, tente novamente mais tarde.",
    };
  }
}

export async function checkImei(
  imei: string,
  brand?: string,
  model?: string,
): Promise<ImeiValidationResult> {
  try {
    const existingDevices = await getDeviceByImei(imei);
    const imeiExists = existingDevices.some(
      (existingDevice: Device) => existingDevice.imei === imei,
    );

    if (imeiExists) {
      const devicesWithSameIMEI = existingDevices.find(
        (existingDevice: Device) => existingDevice.imei === imei,
      );

      const userId = await getUserId();

      // Se o IMEI pertence ao usuário logado
      if (devicesWithSameIMEI?.auth_id === userId) {
        return {
          isValid: true,
          isTheUserTryingToRegisterADeviceHeAlreadyOwns: true,
          error: "Este IMEI já foi cadastrado por você.",
        };
      }

      // Se o IMEI pertence a outro usuário
      if (
        devicesWithSameIMEI?.auth_id !== userId &&
        devicesWithSameIMEI?.auth_id !== null
      ) {
        try {
          return {
            isValid: true,
            alreadyRegistered: true,
          };
        } catch (error) {
          return { isValid: true };
        }
      }
    }

    if (brand && model) {
      return await validateImeiWithExternalApi(imei, brand, model);
    }

    return {
      isValid: true,
      isUpdate: checkIfNeedsToUpdate(existingDevices, imei)?.isUpdate,
      deviceId: checkIfNeedsToUpdate(existingDevices, imei)?.deviceId,
    };
  } catch (error) {
    console.error("Erro ao verificar IMEI:", error);
    return {
      isValid: false,
      error:
        "Não foi possível verificar o IMEI no momento. Por favor, tente novamente mais tarde.",
    };
  }
}

function checkIfNeedsToUpdate(existingDevices: any, imei: string) {
  const imeiExists = existingDevices.some(
    (existingDevice: Device) => existingDevice.imei === imei,
  );

  if (imeiExists) {
    const devicesWithSameIMEI = existingDevices.find(
      (existingDevice: Device) => existingDevice.imei === imei,
    );

    if (
      devicesWithSameIMEI.auth_id === null ||
      devicesWithSameIMEI.auth_id.length === 0
    ) {
      return {
        isValid: true,
        isUpdate: true,
        deviceId: devicesWithSameIMEI.$id,
      };
    } else {
      return {
        isUpdate: false,
      };
    }
  }
}
