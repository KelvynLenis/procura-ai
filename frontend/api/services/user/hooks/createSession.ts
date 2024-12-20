import { useState } from 'react';
import { emailPasswordSession } from '../user';
import { CreateEmailPasswordSession, Session } from '../types/session';

const createSession = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreateSession = async (sessionData: CreateEmailPasswordSession) => {
        setError(null);
        setLoading(true);
        try {


            const newSession = await emailPasswordSession(sessionData);

            setSession(newSession);
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Erro ao criar sessão.');
        } finally {
            setLoading(false);

        }
    };

    return { session, error, loading, handleCreateSession };
};

export default createSession;
