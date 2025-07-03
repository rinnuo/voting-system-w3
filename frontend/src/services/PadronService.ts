import { padronApi } from "./interceptors";
import axios from "axios";
import type { Votante, VotantePublico } from "../models/votante";

export class PadronService {
	static async listVotantes(): Promise<Votante[]> {
		const res = await padronApi.get<Votante[]>("Votantes/");
		return res.data;
	}

	static async getVotante(id: number): Promise<Votante> {
		const res = await padronApi.get<Votante>(`Votantes/${id}/`);
		return res.data;
	}

	static async createVotante(data: Omit<Votante, "id">): Promise<Votante> {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (value !== null) {
				formData.append(key, value);
			}
		});
		const res = await padronApi.post<Votante>("Votantes/", formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return res.data;
	}

	static async updateVotante(id: number, data: Partial<Omit<Votante, "id">>): Promise<Votante> {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				formData.append(key, value);
			}
		});
		const res = await padronApi.patch<Votante>(`Votantes/${id}/`, formData, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return res.data;
	}

	static async deleteVotante(id: number): Promise<void> {
		await padronApi.delete(`Votantes/${id}/`);
	}

	static async getVotantePublico(ci: string): Promise < VotantePublico > {
		const res = await axios.get(`http://localhost:7265/api/Votantes/publico/${ci}/`);
		return res.data;
	}
}