export interface Notificacion {
  id: number;
  usuario_id: number;
  tipo: 'cobro_pendiente' | 'mora' | 'resumen_diario' | 'sistema';
  titulo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}