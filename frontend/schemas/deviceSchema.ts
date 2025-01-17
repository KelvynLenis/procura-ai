import { z } from "zod";

// Schema para validar as permissões
const PermissionsSchema = z.array(z.string().regex(/^(read|update|delete)\("user:.+"\)$/));

// Schema principal
const DeviceSchema = z.object({
  $collectionId: z.string(), // ID da coleção
  $createdAt: z.string().datetime(), // Data de criação (ISO 8601)
  $databaseId: z.string(), // ID do banco de dados
  $id: z.string(), // ID único do documento
  $permissions: PermissionsSchema, // Lista de permissões no formato especificado
  $updatedAt: z.string().datetime(), // Data de atualização (ISO 8601)
  auth_id: z.string(),
  brand: z.string(), // Marca do dispositivo
  imei: z.string(), // IMEI do dispositivo
  isStolen: z.boolean(), // Indica se o dispositivo é roubado
  phone_model: z.string(), // Modelo do telefone
  phone_number: z.string(), // Número de telefone
});

export default DeviceSchema;