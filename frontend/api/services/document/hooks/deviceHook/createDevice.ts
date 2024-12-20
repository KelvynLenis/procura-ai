import { useState } from 'react';
import { AppwriteDocument, CreateDocumentParams } from '../../types/document.dto';
import { createDocument } from '../../document';
import { v4 as uuidv4 } from 'uuid';
import { Device } from '../../types/device.dto';

export function useCreateDevice() {
    const [loading, setLoading] = useState(false);
    const [errorCreate, setErrorCreate] = useState<Error | null>(null);
    const [createdDocument, setCreatedDocument] = useState<AppwriteDocument<Device> | null>(null);

    const createDevice = async (deviceData: Device) => {
        setLoading(true);
        setErrorCreate(null);
        try {
            const documentId = uuidv4();

            const newDocumentData: CreateDocumentParams<Device> = {
                databaseId: process.env.NEXT_PUBLIC__DATABASE_ID as string,
                collectionId: process.env.NEXT_PUBLIC__COLLECTION_ID as string,
                documentId,
                data: deviceData,
            };

            const newDevice = await createDocument(newDocumentData);
            setCreatedDocument(newDevice);
            return document;
        } catch (err: any) {
            setErrorCreate(err?.response?.data?.message || err.message || 'Erro ao criar.');

        } finally {
            setLoading(false);
        }
    };

    return {
        createDevice,
        loading,
        errorCreate,
        createdDocument,
    };
}
