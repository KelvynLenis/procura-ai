import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get('placeId');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!

  const url = `https://maps.googleapis.com/maps/api/place/details/json?placeid=${placeId}&key=${apiKey}`

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
