import { eleccionApi } from "./interceptors";
import type { Recinto } from "../models/recinto";

export class EleccionService {
  static async listRecintos(): Promise<Recinto[]> {
    const res = await eleccionApi.get<Recinto[]>("admin/recintos/");
    return res.data;
  }

  static async getRecinto(id: number): Promise<Recinto> {
    const res = await eleccionApi.get<Recinto>(`admin/recintos/${id}/`);
    return res.data;
  }

  static async createRecinto(data: Omit<Recinto, "id">): Promise<Recinto> {
    const res = await eleccionApi.post<Recinto>("admin/recintos/", data);
    return res.data;
  }

  static async updateRecinto(id: number, data: Partial<Omit<Recinto, "id">>): Promise<Recinto> {
    const res = await eleccionApi.patch<Recinto>(`admin/recintos/${id}/`, data);
    return res.data;
  }

  static async deleteRecinto(id: number): Promise<void> {
    await eleccionApi.delete(`admin/recintos/${id}/`);
  }

  static async listSecciones(): Promise<Recinto[]> {
    const res = await eleccionApi.get<Recinto[]>("admin/secciones/");
    return res.data;
  }

  static async getSeccion(id: number): Promise<Recinto> {
    const res = await eleccionApi.get<Recinto>(`admin/secciones/${id}/`);
    return res.data;
  }

  static async createSeccion(data: Omit<Recinto, "id">): Promise<Recinto> {
    const res = await eleccionApi.post<Recinto>("admin/secciones/", data);
    return res.data;
  }

  static async updateSeccion(id: number, data: Partial<Omit<Recinto, "id">>): Promise<Recinto> {
    const res = await eleccionApi.patch<Recinto>(`admin/secciones/${id}/`, data);
    return res.data;
  }

  static async deleteSeccion(id: number): Promise<void> {
    await eleccionApi.delete(`admin/secciones/${id}/`);
  }
}