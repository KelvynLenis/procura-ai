import api from '../../api';
import { CreateDocumentParams, DeleteDocumentParams, AppwriteDocument, DocumentsList, GetDocumentParams, ListDocumentsParams, UpdateDocumentParams } from './types/document.dto';


export const createDocument = async <T>(createDocumentParams: CreateDocumentParams<T>): Promise<AppwriteDocument<T>> => {
    const response = await api.post(`/databases/${createDocumentParams.databaseId}/collections/${createDocumentParams.collectionId}/documents`, {
        documentId: createDocumentParams.documentId,
        data: createDocumentParams.data,
        permissions: createDocumentParams.permissions
    });
    console.log(response)
    return response.data;
};

export const listDocuments = async <T>(listParams: ListDocumentsParams): Promise<DocumentsList<T>> => {

    const adjustedQueries = listParams?.queries?.map((query, index) => {
        return {
            [`queries[${index}]`]: JSON.stringify(query),
        };
    });

    const response = await api.get(`/databases/${listParams.databaseId}/collections/${listParams.collectionId}/documents`, {
        params: adjustedQueries?.reduce((acc, query) => ({ ...acc, ...query }), {}),
    });

    return response.data;
};


export const getDocument = async <T>(data: GetDocumentParams): Promise<AppwriteDocument<T>> => {
    const response = await api.get(`/databases/${process.env.DATABASE_ID}/collections/${process.env.COLLECTION_ID}/documents/${data.documentId}`);
    return response.data;
};


export const deleteDocument = async (data: DeleteDocumentParams) => {
    const response = await api.delete(`/databases/${process.env.DATABASE_ID}/collections/${process.env.COLLECTION_ID}/documents/${data.documentId}`);
    return response.data
};


export const updateDocument = async <T>(updateDocumentParams: UpdateDocumentParams<T>): Promise<AppwriteDocument<T>> => {
    const response = await api.patch(`/databases/${updateDocumentParams.databaseId}/collections/${updateDocumentParams.collectionId}/documents/${updateDocumentParams.documentId}`, {
        data: updateDocumentParams.data,
        permissions: updateDocumentParams.permissions
    });
    return response.data;
};