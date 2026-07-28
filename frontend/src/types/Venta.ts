export interface ItemVenta {
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

export interface VentaFormulario {
  cliente_id?: number | null;
  metodo_pago: 'contado' | 'fiado';
  observaciones?: string;
  detalles: ItemVenta[];
  dias_plazo?: number;
}

export interface DetalleVenta {
  id: number;
  venta_id: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}

export interface Venta {
  id: number;
  fecha: string;
  cliente_id: number | null;
  usuario_id: number;
  total: string;
  metodo_pago: 'contado' | 'fiado';
  observaciones: string | null;
  Cliente: { id: number; nombre: string; apellido: string; cedula: string } | null;
  detalles: DetalleVenta[];
}