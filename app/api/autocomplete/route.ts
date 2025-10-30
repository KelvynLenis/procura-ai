import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get("input");

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY!;

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${apiKey}&components=country:br`;

  const res = await fetch(url);
  const data = await res.json();

  return NextResponse.json(data);
}
