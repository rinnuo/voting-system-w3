export interface Papeleta {
	id: string;
	votante_id: string;
	mesa_id: number;
	habilitada: boolean;
	habilitada_por: number;
	habilitada_en: Date;
	votada_en: Date | null;
}
