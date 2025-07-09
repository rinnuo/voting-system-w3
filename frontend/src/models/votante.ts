export interface Votante {
  id: number;
  ci: string;
  nombreCompleto: string;
  direccion: string;
  fotoCIanverso?: File | null;
  fotoCIreverso?: File | null;
  fotoVotante?: File | null;
  lat: number;
  lng: number;
}

export interface VotantePublico {
  ci: string;
  nombreCompleto: string;
  nombreRecinto: string;
}
