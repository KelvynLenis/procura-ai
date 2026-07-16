import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url); // pega a URL da request
  const userId = searchParams.get("userID"); // pega o query param "userId"
  const appwriteBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "https://procuraai-homolog.secties.pb.gov.br/v1";

  const params = new URLSearchParams({
    "queries[0]": JSON.stringify({
      method: "equal",
      attribute: "receiver_id",
      values: [userId],
    }),
  });

  try {
    const res = await fetch(
      `${appwriteBaseUrl}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION}/documents?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        next: {
          tags: ["notifications"],
        },
      },
    );

    if (!res.ok) {
      console.log("Response:", res);
      throw new Error(`Erro ao buscar notificações: ${res.statusText}`);
    }

    console.log("Chamou API");

    const data = await res.json();

    console.log(data);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro ao buscar livros:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
