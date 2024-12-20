export interface Device {
    $id?: string; // ID do dispositivo
    phoneNumber: string; // Número de telefone
    phoneModel: string; // Modelo do telefone
    brand: string; // Marca do telefone
    imei: string; // IMEI do telefone
    latitude: number; // Latitude da localização do dispositivo
    longitude: number; // Longitude da localização do dispositivo
    isStolen: boolean; // Status de "roubado" (true/false)
}
export class UpdateDeviceDto {
    phoneNumber?: string;
    phoneModel?: string;
    brand?: string;
    imei?: string;
    latitude?: number;
    longitude?: number;
    isStolen?: boolean;
}