type TileProvider = (x: number, y: number, z: number, dpr?: number) => string;

function retinaSuffix(dpr?: number) {
  return dpr && dpr >= 2 ? "@2x" : "";
}

/** Carto basemaps — fallback gratuito para uso em produção. */
export const cartoTileProvider: TileProvider = (x, y, z, dpr) => {
  return `https://basemaps.cartocdn.com/light_all/${z}/${x}/${y}${retinaSuffix(dpr)}.png`;
};

/** MapTiler — preferido quando NEXT_PUBLIC_MAPTILER_API_KEY está configurada. */
export const mapTilerTileProvider: TileProvider = (x, y, z, dpr) => {
  const apiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY;

  if (!apiKey) {
    return cartoTileProvider(x, y, z, dpr);
  }

  return `https://api.maptiler.com/maps/streets-v2/${z}/${x}/${y}${retinaSuffix(dpr)}.png?key=${apiKey}`;
};
