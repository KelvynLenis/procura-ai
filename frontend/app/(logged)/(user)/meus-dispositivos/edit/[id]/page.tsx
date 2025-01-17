import { DeviceForm } from "@/components/Forms/DeviceForm";
import { Device } from "@/utils/types";


export default async function EditDevice({ params }: { params: { id: string } }) {
  const { id } = params;

  if (!process.env.NEXT_PUBLIC_API_URL || !process.env.NEXT_PUBLIC_DATABASE_ID) {
    throw new Error('Configuração incompleta: verifique as variáveis de ambiente.');
  }

  let result: Device;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error: ${error}`);
    }


    result = await response.json();
  } catch (error) {
    console.error('Erro ao buscar dados do dispositivo:', error);
    return <div>Erro ao carregar os dados do dispositivo.</div>;
  }

  console.log('Dados do dispositivo:', result);
  const { brand, phone_model, phone_number, imei } = result;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <DeviceForm device={{ $id: id, brand, phone_model, phone_number, imei }} />
    </div>
  );
}
