import { useState } from 'react';
import { DeleteSession } from '../user';
import { SessionGet } from '../types/session'; // Tipos de sessão

export const useDeleteSession = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    const deleteSession = async (session: SessionGet) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const data = await DeleteSession(session);
            setSuccess(true);
            return data;
        } catch (err: any) {
            setError('Erro ao excluir a sessão');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return { deleteSession, loading, error, success };
};
