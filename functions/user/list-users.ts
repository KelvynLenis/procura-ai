interface ListUsersResponse {
  documents: any[];
  total: number;
}

export async function listUsers(page: number, limit: number): Promise<ListUsersResponse> {
  try {
    const params = new URLSearchParams({
      'queries[0]': JSON.stringify({
        method: 'limit',
        values: [limit],
      }),
      'queries[1]': JSON.stringify({
        method: 'offset',
        values: [(page - 1) * limit],
      }),
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/databases/${process.env.NEXT_PUBLIC_DATABASE_ID}/collections/${process.env.NEXT_PUBLIC_COLLECTION_USER}/documents?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Appwrite-Project': process.env.NEXT_PUBLIC_APP_WRITE_PROJECT_ID || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar usuários: ${await response.text()}`);
    }

    const result = await response.json();
    return {
      documents: result.documents || [],
      total: result.total || 0,
    };
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
} 