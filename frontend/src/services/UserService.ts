import { userApi } from "./interceptors";
import type { User } from "../models/user";

export class UserService {
  static async list(): Promise<User[]> {
    const res = await userApi.get<User[]>("admin/usuarios/");
    return res.data;
  }

  static async get(id: number): Promise<User> {
    const res = await userApi.get<User>(`admin/usuarios/${id}/`);
    return res.data;
  }

  static async create(data: Omit<User, "id"> & { password: string }): Promise<User> {
    const res = await userApi.post<User>("admin/usuarios/", data);
    return res.data;
  }

  static async update(id: number, data: Partial<Omit<User, "id">>): Promise<User> {
    const res = await userApi.patch<User>(`admin/usuarios/${id}/`, data);
    return res.data;
  }

  static async delete(id: number): Promise<void> {
    await userApi.delete(`admin/usuarios/${id}/`);
  }
}