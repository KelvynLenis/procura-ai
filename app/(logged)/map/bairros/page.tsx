import { OccurrencesHeatMap } from '@/components/Maps/OccurrencesHeatMap'
import { OccurrencesMap } from '@/components/Maps/OccurrencesMap'
import { Device, District, Event } from '@/types'
import Link from 'next/link'
import { TbArrowsMinimize } from 'react-icons/tb'

export default async function Dashboard() {
  async function getAllDistricts() {
    let offset = 0
    const limit = 25
    let total = Infinity

    const allDistricts: District[] = []

    while (offset < total) {
      const params = new URLSearchParams({
        'queries[0]': JSON.stringify({
          method: 'equal',
          attribute: 'name_municipality',
          values: ['João Pessoa'],
        }),
        'queries[1]': JSON.stringify({
          method: 'limit',
          values: [limit],
        }),
        'queries[2]': JSON.stringify({
          method: 'offset',
          values: [offset],
        }),
      })

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DISTRICT}/documents?${params.toString()}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
            },
            cache: 'no-store',
          }
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch events: ${await response.text()}`)
        }

        const { documents, total: fetchedTotal } = await response.json()

        allDistricts.push(...documents)
        total = fetchedTotal
        offset += limit
      } catch (error) {
        console.error(error)
        break
      }
    }

    return allDistricts
  }

  let districtsData: District[] = []

  try {
    const dashboardData = await getAllDistricts()

    districtsData = dashboardData
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
