export interface Pago {
  id: number;
  credito_id: number;
  usuario_id: number;
  monto: string;
  fecha: string;
}

export interface Credito {
  id: number;
  venta_id: number;
  cliente_id: number;
  monto_total: string;
  saldo: string;
  fecha_limite: string;
  estado: 'pendiente' | 'pagado' | 'vencido';
  dias_mora: number;
  Cliente: { id: number; nombre: string; apellido: string; cedula: string };
  Venta?: { id: number; fecha: string; total: string };
  pagos?: Pago[];
}

export interface PagoFormulario {
  credito_id: number;
  monto: number;
}