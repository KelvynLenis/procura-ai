import { useState, useCallback } from 'react';
import { AppwriteDocument, UpdateDocumentParams } from '../../types/document.dto';
import { updateDocument } from '../../document';
import { Device, UpdateDeviceDto } from '../../types/device.dto';

export function useUpdateDocument() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorUpload, setErrorUpload] = useState<string | null>(null);
    const [data, setData] = useState<AppwriteDocument<UpdateDeviceDto> | null>(null);

    const update = useCallback(async (id: string, params: UpdateDeviceDto) => {
        setIsLoading(true);
        setErrorUpload(null);

        try {
            const updateDocumentData: UpdateDocumentParams<UpdateDeviceDto> = {
                databaseId: process.env.NEXT_PUBLIC__DATABASE_ID as string,
                collectionId: process.env.NEXT_PUBLIC__COLLECTION_ID as string,
                documentId: id,
                data: params
            }
            const updatedDocument = await updateDocument(updateDocumentData);
            setData(updatedDocument);
            return updatedDocument;
        } catch (err: any) {
            setErrorUpload(err?.response?.data?.message || err.message || 'Erro ao atualizar.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { update, isLoading, errorUpload, data };
};
