export interface CreateEmailPasswordSession {
    email: string;
    password: string;
}

export interface SessionGet {
    id: string;
}

export interface Session {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    userId: string;
    expire: string;
    provider: string;
    providerUid: string;
    providerAccessToken: string;
    providerAccessTokenExpiry: string;
    providerRefreshToken: string;
    ip: string;
    osCode: string;
    osName: string;
    osVersion: string;
    clientType: string;
    clientCode: string;
    clientName: string;
    clientVersion: string;
    clientEngine: string;
    clientEngineVersion: string;
    deviceName: string;
    deviceBrand: string;
    deviceModel: string;
    countryCode: string;
    countryName: string;
    current: boolean;
    factors: string[];
    secret: string;
    mfaUpdatedAt: string;
}
