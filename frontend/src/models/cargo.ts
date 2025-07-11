export interface Cargo {
  id: number;
  nombre: string;
  descripcion: string;
  eleccion: number;
  secciones: number[];
  eleccion_nombre?: string;
}
