import type { Device, QueryFilter } from '../../types'

// interface QueryFilter {
//   method: string
//   attribute: string
//   values: any[]
// }

interface ListDevicesProps {
  filters?: QueryFilter[] // Array of filter objects
}

export async function getDevices(props?: ListDevicesProps): Promise<Device[]> {
  const allDevices: Device[] = []
  const filters = props?.filters || []

  let offset = 0
  const limit = 25
  let total = Number.POSITIVE_INFINITY

  while (offset < total) {
    // Start with default queries
    const params = new URLSearchParams()

    // Add the stolen filter by default if no filters provided
    if (filters.length === 0) {
      params.append(
        'queries[0]',
        JSON.stringify({
          method: 'equal',
          attribute: 'is_stolen',
          values: [true],
        })
      )
    } else {
      // Add all custom filters
      filters.forEach((filter, index) => {
        params.append(`queries[${index}]`, JSON.stringify(filter))
      })
    }

    // Add pagination queries
    params.append(
      `queries[${filters.length > 0 ? filters.length : 1}]`,
      JSON.stringify({
        method: 'limit',
        values: [limit],
      })
    )

    params.append(
      `queries[${filters.length > 0 ? filters.length + 1 : 2}]`,
      JSON.stringify({
        method: 'offset',
        values: [offset],
      })
    )

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_DEVICE}/documents?${params.toString()}`,
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
        throw new Error(
          `Failed to fetch stolen devices: ${await response.text()}`
        )
      }

      const { documents, total: fetchedTotal } = await response.json()

      allDevices.push(...documents)
      total = fetchedTotal
      offset += limit
    } catch (error) {
      console.error(error)
      break
    }
  }

  return allDevices
}
