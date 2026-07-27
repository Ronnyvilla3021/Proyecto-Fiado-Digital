export interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  cedula: string;
  telefono: string | null;
  direccion: string | null;
  email: string | null;
  limite_credito: string;
  estado: 'activo' | 'inactivo';
  createdAt: string;
  updatedAt: string;
}

export interface ClienteFormulario {
  nombre: string;
  apellido: string;
  cedula: string;
  telefono?: string;
  direccion?: string;
  email?: string;
  limite_credito?: number;
}