export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'SUPER' | 'PADRON' | 'ELECCION' | 'JURADO';
}