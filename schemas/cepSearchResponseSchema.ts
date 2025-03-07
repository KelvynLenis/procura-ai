import { z } from "zod";

const cepSearchResponseSchema = z.object({
  addresstype: z.string(),
  boundingbox: z.array(z.string()).length(4), // Array de exatamente 4 strings
  class: z.string(),
  display_name: z.string(),
  importance: z.number(),
  lat: z.string(),
  licence: z.string(),
  lon: z.string(),
  name: z.string(),
  place_id: z.number(),
  place_rank: z.number(),
  type: z.string(),
});

export default cepSearchResponseSchema;
