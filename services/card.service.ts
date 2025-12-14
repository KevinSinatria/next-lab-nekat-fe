import { api } from "@/lib/api";

type CardPayload = {
  uid: string;
  status: string;
  keterangan: string;
  userId: number;
  kelasId: number;
};

const getAll = async () => {
  const res = await api.get(`/Kartu`);

  return res.data;
};

const create = async (data: CardPayload) => {
  const res = await api.post(`/Kartu`, data);

  return res.data;
};

const getById = async (id: string) => {
  const res = await api.get(`/Kartu/${id}`);

  return res.data;
};

const update = async (id: string, data: CardPayload) => {
  const res = await api.put(`/Kartu/${id}`, data);

  return res.data;
};

const deleteById = async (id: string) => {
  const res = await api.delete(`/Kartu/${id}`);

  return res.data;
};

const cardCheck = async (uid: string) => {
  const res = await api.get(`/Kartu/check/${uid}`);

  return res.data;
};

export const cardService = {
  getAll,
  create,
  getById,
  update,
  deleteById,
  cardCheck,
};
