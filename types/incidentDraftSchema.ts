import { z } from "zod";

export const IncidentDraftSchema = z.object({
  $id: z.string(),
  auth_id: z.string(),
  id_device: z.string(),
  status: z.string(),
  suggested_type: z.string().optional(),
  description: z.string().optional().nullable(),
  time_event: z.string().optional().nullable(),
  location: z.array(z.number()).optional().nullable(),
  evidence_uri: z.string().optional().nullable(),
  risk_level: z.union([z.string(), z.number()]).optional().nullable(),
  incident_state: z.string().optional().nullable(),
  modalities: z.any().optional().nullable(),
  reasons: z.any().optional().nullable(),
  source: z.string().optional().nullable(),
  expires_at: z.string().optional().nullable(),
  $createdAt: z.string().optional(),
});

export type IncidentDraft = z.infer<typeof IncidentDraftSchema>;
