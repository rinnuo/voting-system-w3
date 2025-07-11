import { votacionApi } from "./interceptors";
import type { Voto } from "../models/voto";
import type { Papeleta } from "../models/papeleta";
import type { Resultado } from "../models/resultado";

export class VotacionService {
	static async listVotos(): Promise<Voto[]> {
		const res = await votacionApi.get<Voto[]>("admin/voto/")
		return res.data;
	}

	static async votar(data: Omit<Voto, "timestamp">): Promise<void> {
		await votacionApi.post("admin/voto/votar/", data);
	}


	static async listPapeletas(): Promise<Papeleta[]> {
		const res = await votacionApi.get<Papeleta[]>("admin/papeleta/");
		return res.data.map(p => ({
			...p,
			habilitada_en: new Date(p.habilitada_en),
			votada_en: p.votada_en ? new Date(p.votada_en) : null,
		}));
	}

	static async habilitarPapeleta(id: string): Promise<void> {
		await votacionApi.post(`admin/papeleta/habilitar/`, { id });
	}

	static async deletePapeleta(id: string): Promise<void> {
		await votacionApi.delete(`admin/papeleta/${id}/`);
	}

	static async getResultadosPublicos(eleccion: number, seccion: number): Promise<Resultado[]> {
		const res = await votacionApi.get<Resultado[]>(
			`admin/voto/resultados/?eleccion=${eleccion}&seccion=${seccion}`
		);
		return res.data;
	}
}