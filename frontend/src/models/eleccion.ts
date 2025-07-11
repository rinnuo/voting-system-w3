export interface Eleccion {
  id: number;
  nombre: string;
  tipo: 'NACIONAL' | 'MUNICIPAL' | 'REGIONAL';
  fecha: Date;
  activa: boolean;
  secciones: number[];
}