import { NextResponse } from "next/server";
import { Client, Databases, ID, Query } from "node-appwrite";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, cpf, email } = body;

    if (!userId || !cpf || !email) {
      return NextResponse.json(
        { error: "userId, cpf e email são obrigatórios" },
        { status: 400 }
      );
    }

    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_API_URL!)
      .setProject(process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID!)
      .setKey(
        process.env.APP_WRITE_API_KEY ?? process.env.NEXT_PUBLIC_APP_WRITE_API_KEY ?? "",
      );

    if (!process.env.APP_WRITE_API_KEY && !process.env.NEXT_PUBLIC_APP_WRITE_API_KEY) {
      return NextResponse.json(
        { error: "APP_WRITE_API_KEY ou NEXT_PUBLIC_APP_WRITE_API_KEY são obrigatórias" },
        { status: 500 },
      );
    }

    const databases = new Databases(client);

    // Verificar se documento já existe
    const existingDocs = await databases.listDocuments(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_COLLECTION_USER!,
      [Query.equal("user_id", userId)]
    );

    if (existingDocs.documents.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Usuário já sincronizado",
        document: existingDocs.documents[0],
      });
    }

    // Criar documento na collection User
    const document = await databases.createDocument(
      process.env.NEXT_PUBLIC_DATABASE_ID!,
      process.env.NEXT_PUBLIC_COLLECTION_USER!,
      ID.unique(),
      {
        user_id: userId,
        name: name || "Usuário",
        cpf: cpf,
        email: email,
      }
    );

    console.log("Documento criado na collection User:", document.$id);

    return NextResponse.json({
      success: true,
      message: "Usuário sincronizado com sucesso",
      document,
    });
  } catch (error) {
    console.error("Erro ao sincronizar usuário:", error);
    return NextResponse.json(
      {
        error: "Erro ao sincronizar usuário",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
