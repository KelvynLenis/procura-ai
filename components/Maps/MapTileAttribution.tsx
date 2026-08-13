export function MapTileAttribution() {
  const usesMapTiler = Boolean(process.env.NEXT_PUBLIC_MAPTILER_API_KEY);

  if (usesMapTiler) {
    return (
      <span>
        {" © "}
        <a
          href="https://www.maptiler.com/copyright/"
          target="_blank"
          rel="noreferrer noopener"
        >
          MapTiler
        </a>
        {" © "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer noopener"
        >
          OpenStreetMap
        </a>
        {" contributors"}
      </span>
    );
  }

  return (
    <span>
      {" © "}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noreferrer noopener"
      >
        OpenStreetMap
      </a>
      {" contributors © "}
      <a
        href="https://carto.com/attributions"
        target="_blank"
        rel="noreferrer noopener"
      >
        CARTO
      </a>
    </span>
  );
}

export const mapAttributionProps = {
  attributionPrefix: false as const,
  attribution: <MapTileAttribution />,
};
