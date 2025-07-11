export interface Candidatura {
  id: number;
  nombres: string;
  ci: string;
  foto?: File | null;
  partido: number;
  cargo: number;
  secciones: number[];
}
