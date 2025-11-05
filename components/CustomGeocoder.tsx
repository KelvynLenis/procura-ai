"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CustomGeocodingControlProps {
  onLocationSelect: (coordinates: [number, number]) => void;
  apiKey: string;
}

export function CustomGeocodingControl({
  onLocationSelect,
  apiKey,
}: CustomGeocodingControlProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const bbox = "-38.9,-8.31,-34.5,-6"; // [west,south,east,north]

      // Use MapTiler's Geocoding API directly with bounding box
      const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?key=${apiKey}&limit=5&bbox=${bbox}`,
      );

      if (!response.ok) {
        throw new Error("Geocoding request failed");
      }

      const data = await response.json();
      setSearchResults(data.features || []);
      setShowResults(true);
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Falha ao buscar o endereço. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (feature: any) => {
    if (feature.center) {
      // Convert to [lat, lng] format as expected by the original component
      onLocationSelect([feature.center[1], feature.center[0]]);
      setShowResults(false);
      setSearchQuery(feature.place_name || "");
    }
  };

  return (
    <>
      <div className="relative z-10 w-full md:w-[420px] lg:w-[500px]">
        <div className="flex">
          <input
            type="text"
            value={searchQuery}
            onClick={(e) => {
              searchQuery.length > 0 && setShowResults(true);
            }}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o endereço ou CEP"
            className="w-full rounded-l border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="rounded-r bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isLoading ? "..." : "Buscar"}
          </button>
        </div>

        {showResults && searchResults.length > 0 && (
          <div className="absolute z-[20] mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow-lg">
            {searchResults.map((feature, index) => (
              <div
                key={index}
                className="cursor-pointer p-2 hover:bg-gray-100"
                onClick={() => handleResultClick(feature)}
              >
                {feature.place_name}
              </div>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && (
          <div className="absolute mt-1 w-full rounded border border-gray-300 bg-white p-2 shadow-lg">
            Nenhum resultado encontrado
          </div>
        )}
      </div>

      <div
        onClick={() => setShowResults(false)}
        className={cn(
          "absolute left-0 top-0 z-[1] h-full w-full bg-transparent",
          showResults ? "block" : "hidden",
        )}
      />
    </>
  );
}
