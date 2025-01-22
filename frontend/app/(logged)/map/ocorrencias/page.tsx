import { OccurrencesMap } from "@/components/Maps/OccurrencesMap";
import Link from "next/link";
import { TbArrowsMinimize } from "react-icons/tb";

export default async function Dashboard() {

  return (
    <div className="flex flex-col">
      <OccurrencesMap />
      <Link href={'/dashboard'}>
        <TbArrowsMinimize size={38} className="absolute top-4 right-5 z-10 hover:animate-pulse bg-white rounded-xl p-1 shadow" />
      </Link>
    </div>
  )
}