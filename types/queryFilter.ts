import { z } from "zod";

export const QueryFilterSchema = z.object({
  method: z.string(),
  attribute: z.string(),
  values: z.array(z.any()),
});
