import { listDevices } from '@/functions/devices/list-devices'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const params = new URLSearchParams(searchParams)

  const data = await listDevices({ params })

  return NextResponse.json(data)
}
