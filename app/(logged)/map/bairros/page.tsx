export const dynamic = "force-dynamic";
import { OccurrencesHeatMap } from "@/components/Maps/OccurrencesHeatMap";
import { District } from "@/types";
import Link from "next/link";
import { TbArrowsMinimize } from "react-icons/tb";
import { listDistricts } from "@/functions/district/list-districts";

export default async function Dashboard() {
  let districtsData: District[] = [];

  try {
    const dashboardData = await listDistricts();
    districtsData = dashboardData;

    console.log(districtsData);
  } catch (error) {
    console.error(error);
  }

  return (
    <div className="flex flex-col">
      <OccurrencesHeatMap districts={districtsData} />
      <Link href={"/dashboard"}>
        <TbArrowsMinimize
          size={38}
          className="absolute right-5 top-4 z-10 rounded-xl bg-white p-1 shadow hover:animate-pulse"
        />
      </Link>
    </div>
  );
}
