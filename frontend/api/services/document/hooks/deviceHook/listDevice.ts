import { useState, useCallback } from 'react';
import { listDocuments } from '../../document'; // Função que você já possui
import { Query } from '../../types/query.dto';
import { DocumentsList } from '../../types/document.dto';
import { Device } from '../../types/device.dto';

export const useListDevices = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [devices, setDevices] = useState<DocumentsList<Device> | null>(null);

    const list = useCallback(async (queries: Query[]) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await listDocuments<Device>({
                // databaseId: "6733470500025755b18b",
                // collectionId: "6733470c001aa5ee02e3",
                databaseId: process.env.NEXT_PUBLIC_DATABASE_ID as string,
                collectionId: process.env.NEXT_PUBLIC_COLLECTION_ID as string,
                queries
            });
            setDevices(response);
            return response;
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Erro ao carregar dispositivos.');
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { list, isLoading, error, devices };
};
