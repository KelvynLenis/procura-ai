export interface CreateUser {
    userId?: string;
    name?: string;
    email: string;
    password: string;
}

export interface CreateUserResponse {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    registration: string;
    status: boolean;
    labels: string[]; // Assumindo que são strings, mas ajuste conforme necessário
    passwordUpdate: string;
    email: string;
    phone: string;
    emailVerification: boolean;
    phoneVerification: boolean;
    mfa: boolean;
    prefs: Record<string, any>; // Assumindo que é um objeto genérico
    targets: CreateUser[];
    accessedAt: string;
}
