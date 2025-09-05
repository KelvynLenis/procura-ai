import { OccurrencesHeatMap } from '@/components/Maps/OccurrencesHeatMap'
import { District } from '@/types'
import Link from 'next/link'
import { TbArrowsMinimize } from 'react-icons/tb'
import { listDistricts } from '@/functions/district/list-districts'

export default async function Dashboard() {
  let districtsData: District[] = []

  try {
    const dashboardData = await listDistricts()
    districtsData = dashboardData

    console.log(districtsData)
  } catch (error) {
    console.error(error)
  }

  return (
    <div className="flex flex-col">
      <OccurrencesHeatMap districts={districtsData} />
      <Link href={'/dashboard'}>
        <TbArrowsMinimize
          size={38}
          className="absolute top-4 right-5 z-10 hover:animate-pulse bg-white rounded-xl p-1 shadow"
        />
      </Link>
    </div>
  )
}
