import { useState } from 'react';
import { createUser } from '../user';
import { CreateUser, CreateUserResponse } from '../types/user';
import { v4 as uuidv4 } from 'uuid'; // Importando a função para gerar UUID

const useCreateUser = () => {
  const [user, setUser] = useState<CreateUserResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async (userData: CreateUser) => {
    setError(null);
    setLoading(true);

    try {
      const userId = uuidv4();

      const newUserData = { ...userData, userId };


      const newUser: CreateUserResponse = await createUser(newUserData);

      setUser(newUser);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Erro ao criar usuário.');
    } finally {
      setLoading(false);

    }
  };

  return { user, error, loading, handleCreateUser };
};

export default useCreateUser;
