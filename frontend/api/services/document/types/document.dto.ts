import { Query } from "./query.dto";

export interface BaseParams {
    databaseId: string;
    collectionId: string;
}


export interface CreateDocumentParams<T> extends BaseParams {
    documentId?: string;
    data: T;
    permissions?: string[];
    // "permissions": ["read(\"any\")"],
    // resposta da requisição vem assim"$permissions": [
    // 			"read(\"user:672a73d9002b25a0408b\")",
    // 			"update(\"user:672a73d9002b25a0408b\")",
    // 			"delete(\"user:672a73d9002b25a0408b\")"
    // 		],
}


export interface GetDocumentParams extends BaseParams {
    documentId: string;
    queries?: Query[];
}
export interface ListDocumentsParams extends BaseParams {
    queries?: Query[];
}

export interface UpdateDocumentParams<T> extends BaseParams {
    documentId: string;
    data: T
    permissions?: string[];
}


export interface DeleteDocumentParams extends BaseParams {
    documentId: string;
}

export interface AppwriteDocument<T> {
    $id: string;
    $collectionId: string;
    $databaseId: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    [key: string]: T | string | string[] | undefined;
}


export interface DocumentsList<T> {
    total: number;
    documents: AppwriteDocument<T>[];
}
