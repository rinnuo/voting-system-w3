export interface Votante {
	id: number;
	ci: string;
	nombreCompleto: string;
	direccion: string;
	recintoId: number;
	fotoCIanverso?: File | null;
	fotoCIreverso?: File | null;
	fotoVotante?: File | null;
}

export interface VotantePublico {
	ci: string;
	nombreCompleto: string;
	recintoId: number;
	nombreRecinto: string;
}