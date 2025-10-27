export async function getGeoJsonData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch GeoJSON data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching GeoJSON data:", error);
    throw error;
  }
}
