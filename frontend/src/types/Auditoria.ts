export interface RegistroAuditoria {
  id: number;
  usuario_id: number | null;
  accion: 'crear' | 'editar' | 'desactivar' | 'reactivar' | 'pago';
  entidad: string;
  entidad_id: number;
  descripcion: string;
  detalles: Record<string, any> | null;
  createdAt: string;
  Usuario: { id: number; nombre: string; rol: string } | null;
}