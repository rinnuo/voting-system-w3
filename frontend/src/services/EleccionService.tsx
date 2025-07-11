import { eleccionApi } from "./interceptors";
import type { Recinto } from "../models/recinto";
import type { Seccion } from "../models/seccion";
import type { Eleccion } from "../models/eleccion";
import type { Mesa } from "../models/mesa";
import type { Cargo } from "../models/cargo";
import type { Partido } from "../models/partido";
import type { Candidatura } from "../models/candidatura";
import type { Participacion } from "../models/participacion";

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


  static async listSecciones(): Promise<Seccion[]> {
    const res = await eleccionApi.get<Seccion[]>("admin/secciones/");
    return res.data;
  }

  static async getSeccion(id: number): Promise<Seccion> {
    const res = await eleccionApi.get<Seccion>(`admin/secciones/${id}/`);
    return res.data;
  }

  static async createSeccion(data: Omit<Seccion, "id">): Promise<Seccion> {
    const res = await eleccionApi.post<Seccion>("admin/secciones/", data);
    return res.data;
  }

  static async updateSeccion(id: number, data: Partial<Omit<Seccion, "id">>): Promise<Seccion> {
    const res = await eleccionApi.patch<Seccion>(`admin/secciones/${id}/`, data);
    return res.data;
  }

  static async deleteSeccion(id: number): Promise<void> {
    await eleccionApi.delete(`admin/secciones/${id}/`);
  }


  static async listElecciones(): Promise<Eleccion[]> {
    const res = await eleccionApi.get<Eleccion[]>("admin/elecciones/");
    return res.data.map(e => ({ ...e, fecha: new Date(e.fecha) }));
  }

  static async getEleccion(id: number): Promise<Eleccion> {
    const res = await eleccionApi.get<Eleccion>(`admin/elecciones/${id}/`);
    return { ...res.data, fecha: new Date(res.data.fecha) };
  }

  static async createEleccion(data: Omit<Eleccion, "id">): Promise<Eleccion> {
    const payload = {
      ...data,
      fecha: data.fecha.toISOString().split("T")[0],
    };
    const res = await eleccionApi.post<Eleccion>("admin/elecciones/", payload);
    return { ...res.data, fecha: new Date(res.data.fecha) };
  }

  static async updateEleccion(id: number, data: Partial<Omit<Eleccion, "id">>): Promise<Eleccion> {
    const payload = {
      ...data,
      fecha: data.fecha instanceof Date
        ? data.fecha.toISOString().split("T")[0]
        : data.fecha,
    };
    const res = await eleccionApi.patch<Eleccion>(`admin/elecciones/${id}/`, payload);
    return { ...res.data, fecha: new Date(res.data.fecha) };
  }

  static async deleteEleccion(id: number): Promise<void> {
    await eleccionApi.delete(`admin/elecciones/${id}/`);
  }


  static async listMesas(): Promise<Mesa[]> {
    const res = await eleccionApi.get<Mesa[]>("admin/mesas/");
    return res.data;
  }

  static async getMesa(id: number): Promise<Mesa> {
    const res = await eleccionApi.get<Mesa>(`admin/mesas/${id}/`);
    return res.data;
  }

  static async createMesa(data: Omit<Mesa, "id" | "recinto_nombre">): Promise<Mesa> {
    const res = await eleccionApi.post<Mesa>("admin/mesas/", data);
    return res.data;
  }

  static async updateMesa(id: number, data: Partial<Omit<Mesa, "id" | "recinto_nombre">>): Promise<Mesa> {
    const res = await eleccionApi.patch<Mesa>(`admin/mesas/${id}/`, data);
    return res.data;
  }

  static async deleteMesa(id: number): Promise<void> {
    await eleccionApi.delete(`admin/mesas/${id}/`);
  }


  static async listCargos(): Promise<Cargo[]> {
    const res = await eleccionApi.get<Cargo[]>("admin/cargos/");
    return res.data;
  }

  static async getCargo(id: number): Promise<Cargo> {
    const res = await eleccionApi.get<Cargo>(`admin/cargos/${id}/`);
    return res.data;
  }

  static async createCargo(data: Omit<Cargo, "id" | "eleccion_nombre">): Promise<Cargo> {
    const res = await eleccionApi.post<Cargo>("admin/cargos/", data);
    return res.data;
  }

  static async updateCargo(id: number, data: Partial<Omit<Cargo, "id" | "eleccion_nombre">>): Promise<Cargo> {
    const res = await eleccionApi.patch<Cargo>(`admin/cargos/${id}/`, data);
    return res.data;
  }

  static async deleteCargo(id: number): Promise<void> {
    await eleccionApi.delete(`admin/cargos/${id}/`);
  }
  
  
  static async listPartidos(): Promise<Partido[]> {
    const res = await eleccionApi.get<Partido[]>("admin/partidos/");
    return res.data;
  }

  static async getPartido(id: number): Promise<Partido> {
    const res = await eleccionApi.get<Partido>(`admin/partidos/${id}/`);
    return res.data;
  }

  static async createPartido(data: Omit<Partido, "id">): Promise<Partido> {
    const res = await eleccionApi.post<Partido>("admin/partidos/", data);
    return res.data;
  }

  static async updatePartido(id: number, data: Partial<Omit<Partido, "id">>): Promise<Partido> {
    const res = await eleccionApi.patch<Partido>(`admin/partidos/${id}/`, data);
    return res.data;
  }

  static async deletePartido(id: number): Promise<void> {
    await eleccionApi.delete(`admin/partidos/${id}/`);
  }


  static async listCandidaturas(): Promise<Candidatura[]> {
    const res = await eleccionApi.get<Candidatura[]>("admin/candidatura/");
    return res.data;
  }

  static async getCandidatura(id: number): Promise<Candidatura> {
    const res = await eleccionApi.get<Candidatura>(`admin/candidatura/${id}/`);
    return res.data;
  }

  static async createCandidatura(data: Omit<Candidatura, "id">): Promise<Candidatura> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "secciones" && Array.isArray(value)) {
        value.forEach((s) => formData.append("secciones", s.toString()));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as any);
      }
    });

    const res = await eleccionApi.post<Candidatura>("admin/candidatura/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  static async updateCandidatura(id: number, data: Partial<Omit<Candidatura, "id">>): Promise<Candidatura> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "secciones" && Array.isArray(value)) {
        value.forEach((s) => formData.append("secciones", s.toString()));
      } else if (value !== null && value !== undefined) {
        formData.append(key, value as any);
      }
    });

    const res = await eleccionApi.patch<Candidatura>(`admin/candidatura/${id}/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  }

  static async deleteCandidatura(id: number): Promise<void> {
    await eleccionApi.delete(`admin/candidatura/${id}/`);
  }


  static async listParticipacionesPorEleccion(eleccion: number): Promise<Participacion[]> {
    const res = await eleccionApi.get<Participacion[]>(`admin/participaciones/?eleccion=${eleccion}`);
    return res.data;
  }
}