import { api } from "@/lib/api";

type RoomPayload = {
  nama: string;
};

const getAll = async () => {
  const res = await api.get("/Ruangan");

  return res.data;
};

const create = async (data: RoomPayload) => {
  const res = await api.post("/Ruangan", data);

  return res.data;
};

const getById = async (id: string) => {
  const res = await api.get(`/Ruangan/${id}`);

  return res.data;
};

const update = async (id: string, data: RoomPayload) => {
  const res = await api.put(`/Ruangan/${id}`, data);

  return res.data;
};

const deleteById = async (id: string) => {
  const res = await api.delete(`/Ruangan/${id}`);

  return res.data;
};

export const roomService = {
  getAll,
  create,
  getById,
  update,
  deleteById,
};
