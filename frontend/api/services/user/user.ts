import api from '../../api';
import { CreateUser, CreateUserResponse } from '@/api/services/user/types/user';
import { CreateEmailPasswordSession, Session, SessionGet } from '@/api/services/user/types/session';

export const createUser = async (userData: CreateUser): Promise<CreateUserResponse> => {
  const response = await api.post('/account', userData);
  return response.data;
};

export const emailPasswordSession = async (sessionCreate: CreateEmailPasswordSession): Promise<Session> => {
  const response = await api.post("/account/sessions/email", sessionCreate)
  return response.data
}

export const getSession = async (session: SessionGet): Promise<Session> => {
  const response = await api.get(`/account/sessions/${session.id || "current"}`)
  return response.data
}

export const DeleteSession = async (session: SessionGet) => {
  const response = await api.delete(`/account/sessions/${session.id || "current"}`)
  return response.data
}

