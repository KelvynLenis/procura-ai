import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  const body = await req.json();

  try {
    const res = await fetch(
      `https://fra.cloud.appwrite.io/v1/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_NOTIFICATION}/documents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': `${process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID}`,
        },
        body: JSON.stringify(body),
        next: {
          tags: ['notitications'],
        },
      }
    )

    if (!res.ok) {
      console.log('Response:', res)
      throw new Error(`Erro ao buscar notificações: ${res.statusText}`)
    }

    console.log("Chamou API")

    const data = await res.json()

    revalidateTag('notifications')

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Erro ao buscar livros:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}