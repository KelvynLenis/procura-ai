import type { Device } from "@/types";

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
  error?: string;
}

async function validateImeiWithExternalApi(
  imei: string,
  brand: string,
  model: string,
): Promise<ImeiValidationResult> {
  try {
    const response = await fetch(
      `https://alpha.imeicheck.com/api/free_with_key/modelBrandName?key=${process.env.NEXT_PUBLIC_API_KEY_IMEICHECK}&imei=${imei}&format=json`,
    );

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
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "imei",
        values: [imei],
      }),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Erro ao verificar IMEI");
    }

    const existingDevices = await response.json();
    const imeiExists = existingDevices.documents.some(
      (existingDevice: Device) => existingDevice.imei === imei,
    );

    if (imeiExists) {
      return {
        isValid: false,
        error: "Este IMEI já está cadastrado.",
      };
    }

    if (brand && model) {
      return await validateImeiWithExternalApi(imei, brand, model);
    }

    return { isValid: true };
  } catch (error) {
    console.error("Erro ao verificar IMEI:", error);
    return {
      isValid: false,
      error:
        "Não foi possível verificar o IMEI no momento. Por favor, tente novamente mais tarde.",
    };
  }
}
