import { z } from 'zod';

const FeatureSchema = z.object({
  type: z.string(),
  geometry: z.object({
    type: z.string(),
    coordinates: z.array(z.any()), // Pode ajustar conforme o tipo de coordenadas esperado (pontos, linhas, polígonos)
  }),
  properties: z.record(z.any()).optional(), // Propriedades dinâmicas do objeto
});

const MetadataSchema = z.object({
  tileStats: z.record(z.any()), // Ajuste conforme a estrutura do tileStats
});

const FeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(FeatureSchema),
  metadata: MetadataSchema,
});

export { FeatureCollectionSchema };