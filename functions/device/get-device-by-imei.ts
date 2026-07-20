export async function getDeviceByImei(imei: string) {
  try {
    const params = new URLSearchParams({
      "queries[0]": JSON.stringify({
        method: "equal",
        attribute: "imei",
        values: [imei],
      }),
    });

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_API_URL}/databases/${process.env.EXPO_PUBLIC_DATABASE_ID}/collections/${process.env.EXPO_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.EXPO_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Erro ao verificar IMEI");
    }

    const existingDevices = await response.json();

    return existingDevices.documents[0];
  } catch (error) {
    console.error("Erro ao buscar dispositivo:", error);
    return;
  }
}
