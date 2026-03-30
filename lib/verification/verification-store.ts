if (typeof window !== "undefined") {
  throw new Error("Este modulo so pode ser importado no servidor");
}

interface VerificationCodeDocument {
  $id: string;
  email: string;
  hashed_code: string;
  expires_at: string;
  attempts: number;
  user_id: string;
}

interface SaveCodeInput {
  email: string;
  hashedCode: string;
  expiresAt: string;
  userId: string;
  userName?: string;
}

const API_URL =
  process.env.APPWRITE_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://fra.cloud.appwrite.io/v1";

const PROJECT_ID =
  process.env.APPWRITE_PROJECT_ID ?? process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID;

const API_KEY =
  process.env.APPWRITE_API_KEY ?? process.env.NEXT_PUBLIC_APP_WRITE_API_KEY;

const DATABASE_ID =
  process.env.APPWRITE_DATABASE_ID ?? process.env.NEXT_PUBLIC_DATABASE_ID;

const VERIFICATION_COLLECTION_ID =
  process.env.APPWRITE_COLLECTION_VERIFICATION_CODES ??
  process.env.NEXT_PUBLIC_COLLECTION_VERIFICATION_CODES;

const USER_COLLECTION_ID =
  process.env.APPWRITE_COLLECTION_USER ??
  process.env.NEXT_PUBLIC_COLLECTION_USER;

function assertConfig() {
  if (!PROJECT_ID || !DATABASE_ID || !VERIFICATION_COLLECTION_ID) {
    throw new Error("Configuracao do Appwrite incompleta para verification_codes");
  }
}

function buildHeaders() {
  assertConfig();

  return {
    "Content-Type": "application/json",
    "X-Appwrite-Project": PROJECT_ID as string,
    ...(API_KEY ? { "X-Appwrite-Key": API_KEY } : {}),
  };
}

function documentsUrl() {
  assertConfig();
  return `${API_URL}/databases/${DATABASE_ID}/collections/${VERIFICATION_COLLECTION_ID}/documents`;
}

function buildQueries(queries: Array<Record<string, unknown>>) {
  const params = new URLSearchParams();
  queries.forEach((query, index) => {
    params.append(`queries[${index}]`, JSON.stringify(query));
  });
  return params.toString();
}

async function requestJson(url: string, options: RequestInit) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erro ao comunicar com Appwrite");
  }

  return response.json();
}

export async function saveCode({
  email,
  hashedCode,
  expiresAt,
  userId,
  userName,
}: SaveCodeInput) {
  await deleteCodeByEmail(email);

  // Keep required fields in snake_case and only vary user naming.
  // The collection in Appwrite is strict and may reject unknown attributes.
  const payloadCandidates = [
    {
      email,
      hashed_code: hashedCode,
      expires_at: expiresAt,
      attempts: 0,
      user_id: userId,
      user_name: userName ?? "",
    },
    {
      email,
      hashed_code: hashedCode,
      expires_at: expiresAt,
      attempts: 0,
      user_id: userId,
    },
  ];

  let lastError: unknown = null;

  for (const data of payloadCandidates) {
    try {
      return await requestJson(documentsUrl(), {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({
          documentId: "unique()",
          data,
        }),
      });
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "";

      const isDocumentStructureError =
        message.includes("Invalid document structure") ||
        message.includes("Unknown attribute") ||
        message.includes("Missing required attribute");

      if (!isDocumentStructureError) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Erro ao salvar codigo de verificacao");
}

export async function getCodeByEmail(email: string) {
  const query = buildQueries([
    {
      method: "equal",
      attribute: "email",
      values: [email],
    },
    {
      method: "orderDesc",
      attribute: "$createdAt",
    },
    {
      method: "limit",
      values: [1],
    },
  ]);

  const data = await requestJson(`${documentsUrl()}?${query}`, {
    method: "GET",
    headers: buildHeaders(),
  });

  const document = data?.documents?.[0] as VerificationCodeDocument | undefined;
  return document ?? null;
}

export async function incrementAttempts(documentId: string, attempts: number) {
  return requestJson(`${documentsUrl()}/${documentId}`, {
    method: "PATCH",
    headers: buildHeaders(),
    body: JSON.stringify({
      data: { attempts },
    }),
  });
}

export async function deleteCode(documentId: string) {
  const response = await fetch(`${documentsUrl()}/${documentId}`, {
    method: "DELETE",
    headers: buildHeaders(),
  });

  if (!response.ok && response.status !== 404) {
    const message = await response.text();
    throw new Error(message || "Erro ao deletar codigo");
  }
}

export async function deleteCodeByEmail(email: string) {
  const query = buildQueries([
    {
      method: "equal",
      attribute: "email",
      values: [email],
    },
  ]);

  const data = await requestJson(`${documentsUrl()}?${query}`, {
    method: "GET",
    headers: buildHeaders(),
  });

  const documents = (data?.documents ?? []) as Array<{ $id: string }>;

  await Promise.all(documents.map((doc) => deleteCode(doc.$id)));
}

export async function updateUserStatusByAuthId(
  authUserId: string,
  status: string,
) {
  if (!USER_COLLECTION_ID) {
    throw new Error("Configuracao do Appwrite incompleta para users");
  }

  const query = buildQueries([
    {
      method: "equal",
      attribute: "user_id",
      values: [authUserId],
    },
    {
      method: "limit",
      values: [1],
    },
  ]);

  const usersResponse = await requestJson(
    `${API_URL}/databases/${DATABASE_ID}/collections/${USER_COLLECTION_ID}/documents?${query}`,
    {
      method: "GET",
      headers: buildHeaders(),
    },
  );

  const userDocument = usersResponse?.documents?.[0] as { $id: string } | undefined;

  if (!userDocument?.$id) {
    throw new Error("Usuario nao encontrado para atualizar status");
  }

  return requestJson(
    `${API_URL}/databases/${DATABASE_ID}/collections/${USER_COLLECTION_ID}/documents/${userDocument.$id}`,
    {
      method: "PATCH",
      headers: buildHeaders(),
      body: JSON.stringify({
        data: { status },
      }),
    },
  );
}

export async function createSessionTokenByAuthUserId(authUserId: string) {
  if (!API_KEY) {
    throw new Error("APPWRITE_API_KEY obrigatoria para criar sessao");
  }

  return requestJson(`${API_URL}/users/${authUserId}/tokens`, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify({}),
  });
}
