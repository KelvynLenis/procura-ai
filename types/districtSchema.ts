import { z } from "zod";

const districtSchema = z.object({
  $collectionId: z.string(),
  $createdAt: z.string().datetime(),
  $databaseId: z.string(),
  $id: z.string().uuid(),
  $permissions: z.array(z.string()),
  $updatedAt: z.string().datetime(),
  area_km2: z.string(),
  cod_UF: z.number(),
  cod_district: z.number(),
  cod_municipality: z.number(),
  cod_neighborhood: z.number(),
  cod_region: z.number(),
  cod_subdistrict: z.number(),
  lost_counter: z.number(),
  name_UF: z.string(),
  name_district: z.string(),
  name_municipality: z.string(),
  name_neighborhood: z.string(),
  name_region: z.string(),
  robbery_counter: z.number(),
  theft_counter: z.number(),
});

export default districtSchema;
