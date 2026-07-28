import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const imei = req.nextUrl.searchParams.get("imei");

  if (!imei || !/^\d{15}$/.test(imei)) {
    return NextResponse.json({ error: "IMEI inválido" }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_API_KEY_IMEICHECK;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Serviço de IMEI não configurado" },
      { status: 503 },
    );
  }

  const url = `https://alpha.imeicheck.com/api/free_with_key/modelBrandName?key=${apiKey}&imei=${imei}&format=json`;
  const response = await fetch(url);

  if (!response.ok) {
    return NextResponse.json(
      { error: "Erro ao validar IMEI" },
      { status: 502 },
    );
  }

  const data = await response.json();
  return NextResponse.json(data);
}
