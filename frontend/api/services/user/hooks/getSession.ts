import { useState } from 'react';
import { emailPasswordSession, getSession } from '../user';
import { Session, SessionGet } from '../types/session';

const sessionGet = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGetSession = async (sessionData: SessionGet) => {
        setError(null);
        setLoading(true);
        try {


            const responseGetSession = await getSession(sessionData);

            setSession(responseGetSession);
        } catch (err: any) {
            setError(err?.response?.data?.message || err.message || 'Erro ao criar sessão.');
        } finally {
            setLoading(false);

        }
    };

    return { session, error, loading, handleGetSession };
};

export default sessionGet;
