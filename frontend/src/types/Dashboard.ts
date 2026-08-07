export interface DashboardData {
  ventas_hoy: {
    total: string;
    cantidad: number;
  };
  clientes_morosos: {
    cantidad: number;
    clientes: Array<{
      credito_id: number;
      cliente: string;
      saldo: string;
      fecha_limite: string;
    }>;
  };
  credito_activo: {
    total: string;
    cantidad_creditos: number;
  };
  pagos_recibidos_hoy: {
    total: string;
    cantidad: number;
  };
}

export interface VentaPorDia {
  dia: string;
  total: string;
}

export interface MetodoPagoResumen {
  metodo_pago: 'contado' | 'fiado';
  cantidad: string;
  total: string;
}