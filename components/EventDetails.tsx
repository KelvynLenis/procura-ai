import { cn, formatDateTime } from "@/lib/utils";
import { DeviceProps, type OccurrencesProps } from "@/types";
import { X, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface EventDetailsProps {
  occurence: OccurrencesProps;
  closePopup: () => void;
  styles?: string;
  sameLocationOccurrences?: OccurrencesProps[];
  currentIndex?: number;
  onNextOccurrence?: () => void;
  onPrevOccurrence?: () => void;
}

export function EventDetails({
  occurence,
  closePopup,
  styles,
  sameLocationOccurrences,
  currentIndex,
  onNextOccurrence,
  onPrevOccurrence,
}: EventDetailsProps) {
  const pathname = usePathname().slice(1);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOccurrence, setSelectedOccurrence] =
    useState<OccurrencesProps | null>(null);
  const [isViewingDetails, setIsViewingDetails] = useState(false);

  const fullScreenMap = pathname === "map/ocorrencias";
  const hasMultipleOccurrences =
    sameLocationOccurrences && sameLocationOccurrences.length > 1;
  const itemsPerPage = 5;

  const lastLocation = occurence.event?.last_location;
  const googleMapsUrl = `https://www.google.com/maps?q=${lastLocation[0]},${lastLocation[1]}`;

  const totalPages = hasMultipleOccurrences
    ? Math.ceil(sameLocationOccurrences!.length / itemsPerPage)
    : 0;
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageItems = hasMultipleOccurrences
    ? sameLocationOccurrences!.slice(startIndex, endIndex)
    : [];

  function formatType(type: string) {
    if (type === "Furto" || type === "Furto simples") {
      return "Furto simples";
    } else if (type === "Perda" || type === "Extravio ou Perda") {
      return "Extravio ou Perda";
    }
    return type;
  }

  function handleOccurrenceClick(occurrence: OccurrencesProps) {
    setSelectedOccurrence(occurrence);
    setIsViewingDetails(true);
  }

  function handleBackToList() {
    setIsViewingDetails(false);
    setSelectedOccurrence(null);
  }

  function goToPage(page: number) {
    setCurrentPage(page);
  }

  function goToPreviousPage() {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  function renderOccurrenceDetails(occ: OccurrencesProps) {
    return (
      <div className="flex flex-col gap-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToList}
              className="flex items-center gap-1 text-sm text-blue-500 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>
            <span className="text-gray-400">|</span>
            <h3 className="font-semibold text-procura-ai-blue">
              #{occ.event.$id.slice(0, 8)}
            </h3>
          </div>
          <button type="button" onClick={closePopup}>
            <X className="h-6 w-6 cursor-pointer" />
          </button>
        </div>

        <span className="h-0.5 w-full bg-zinc-300" />

        <div className="flex flex-col gap-4">
          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Tipo: </span>
            <span className="flex w-1/3 font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1">
              {formatType(occ.event.type)}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Modelo:</span>
            <span className="flex w-1/3 font-semibold">
              {occ.device.phone_model}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Fabricante:</span>
            <span className="flex w-1/3 font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1">
              {occ.device.brand}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Proprietário:</span>
            <span
              className={cn(
                occ.user.name === "Usuário excluído"
                  ? "italic text-zinc-500"
                  : "flex w-1/3 font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1",
              )}
            >
              {occ.user.name === "Usuário excluído" ? "N/A" : occ.user.name}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Data e hora:</span>
            <span className="flex w-1/3 font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1">
              {formatDateTime(occ.event.time_event)}
            </span>
          </div>

          <div className="flex w-96">
            <span className="lg:w-24 xl:w-32">Detalhe:</span>
            <span
              className={cn(
                occ.event.description
                  ? "flex w-1/3 text-justify font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1"
                  : "italic text-zinc-500",
              )}
            >
              {occ.event.description ? occ.event.description : "Sem detalhes"}
            </span>
          </div>

          {fullScreenMap && (
            <div className="mt-4 flex w-full justify-center">
              <Link
                href={`https://www.google.com/maps?q=${occ.event?.last_location[0]},${occ.event?.last_location[1]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Veja no google maps
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }
  function renderMultipleOccurrencesList() {
    if (!hasMultipleOccurrences || !sameLocationOccurrences) return null;

    return (
      <div className="flex flex-col gap-2">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-procura-ai-blue">
            Ocorrências ({sameLocationOccurrences.length})
          </h3>
          <button type="button" onClick={closePopup}>
            <X className="h-6 w-6 cursor-pointer" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1 border-b pb-2 text-xs font-semibold text-gray-600">
          <span>Data</span>
          <span>Dispositivo</span>
          <span>Proprietário</span>
          <span></span>
        </div>

        <div className="min-h-[240px]">
          {currentPageItems.map((occ, index) => (
            <div
              key={occ.event.$id}
              className="grid cursor-pointer grid-cols-4 gap-1 border-b px-1.5 py-2 text-xs transition-colors last:border-b-0 hover:bg-gray-50"
              onClick={() => handleOccurrenceClick(occ)}
            >
              <div className="flex flex-col">
                <span className="text-xs font-medium">
                  {formatDateTime(occ.event.time_event).split("-")[0]}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDateTime(occ.event.time_event).split("-")[1]}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="truncate text-xs font-medium">
                  {occ.device.phone_model}
                </span>
                <span className="truncate text-xs text-gray-500">
                  {occ.device.brand}
                </span>
              </div>

              <div className="flex flex-col">
                <span
                  className={cn(
                    "truncate text-xs",
                    occ.user.name === "Usuário excluído"
                      ? "italic text-gray-400"
                      : "font-medium",
                  )}
                >
                  {occ.user.name === "Usuário excluído" ? "N/A" : occ.user.name}
                </span>
                <span className="truncate text-xs text-gray-500">
                  {formatType(occ.event.type)}
                </span>
              </div>

              <div className="flex items-center justify-center">
                <ChevronRight className="h-3 w-3 text-blue-500" />
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-2.5 flex items-center justify-between border-t pt-1.5">
            <div className="flex items-center gap-1">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 0}
                className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-3 w-3" />
                Anterior
              </button>
            </div>

            <div className="flex gap-0.5">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={cn(
                    "h-5 w-5 rounded text-xs font-medium",
                    i === currentPage
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                  )}
                  onClick={() => goToPage(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 text-xs hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Próxima
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-1 text-center text-xs text-gray-500">
          Mostrando {startIndex + 1} -{" "}
          {Math.min(endIndex, sameLocationOccurrences.length)} de{" "}
          {sameLocationOccurrences.length} ocorrências
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-/5 flex gap-2 rounded-md ring-1 ring-zinc-200",
        hasMultipleOccurrences ? "w-[420px] max-w-[85vw]" : "",
        styles,
      )}
    >
      <span className="h-full w-1 bg-procura-ai-blue" />

      <div
        className={cn(
          "flex h-fit w-full flex-col gap-2.5 px-2.5 py-3",
          fullScreenMap && "gap-2 px-2 py-2.5",
        )}
      >
        {hasMultipleOccurrences ? (
          isViewingDetails && selectedOccurrence ? (
            renderOccurrenceDetails(selectedOccurrence)
          ) : (
            renderMultipleOccurrencesList()
          )
        ) : (
          <>
            <div className="flex flex-col items-end justify-end gap-2">
              <div className="flex w-full items-center justify-between">
                {fullScreenMap ? (
                  <div className="flex w-full justify-center">
                    <Link
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      Veja no google maps
                    </Link>
                  </div>
                ) : (
                  <span className="flex h-full w-full flex-col text-3xl font-semibold text-procura-ai-blue">
                    #{occurence.event.$id.slice(0, 5)}
                  </span>
                )}

                <button type="button" onClick={closePopup}>
                  <X className="h-6 w-6 cursor-pointer" />
                </button>
              </div>
              <span className="h-0.5 w-full bg-zinc-300" />
            </div>

            <div
              className={cn("flex flex-col gap-4", fullScreenMap && "gap-1")}
            >
              <div className="flex w-96">
                <span className="lg:w-24 xl:w-32">Tipo: </span>
                <span className="flex w-1/3 font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1">
                  {formatType(occurence.event.type)}
                </span>
              </div>

              <div className="flex w-96">
                <span className="lg:w-24 xl:w-32">Modelo:</span>
                <span className="flex w-1/3 font-semibold">
                  {occurence.device.phone_model}
                </span>
              </div>

              <div className="flex w-96">
                <span className="lg:w-24 xl:w-32">Fabricante:</span>
                <span className="flex w-1/3 font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1">
                  {occurence.device.brand}
                </span>
              </div>

              <div className="flex w-96">
                <span className="lg:w-24 xl:w-32">Proprietário:</span>
                <span
                  className={cn(
                    occurence.user.name === "Usuário excluído"
                      ? "italic text-zinc-500"
                      : "flex w-1/3 font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1",
                  )}
                >
                  {occurence.user.name}
                </span>
              </div>

              <div className="flex w-96">
                <span className="lg:w-24 xl:w-32">Data e hora:</span>
                <span className="flex w-1/3 font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1">
                  {formatDateTime(occurence.event.time_event)}
                </span>
              </div>

              <div className="flex w-96">
                <span className="lg:w-24 xl:w-32">Detalhe:</span>
                <span
                  className={cn(
                    occurence.event.description
                      ? "flex w-1/3 text-justify font-semibold xl:w-1/2 1.5xl:w-3/5 2xl:flex-1"
                      : "italic text-zinc-500",
                  )}
                >
                  {occurence.event.description
                    ? occurence.event.description
                    : "Sem detalhes"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
