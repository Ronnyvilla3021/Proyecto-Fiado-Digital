import api from './api';

type FormatoReporte = 'excel' | 'pdf';

interface FiltrosFecha {
  desde?: string;
  hasta?: string;
}

// Descarga un archivo binario (PDF/Excel) y dispara la descarga en el navegador
const descargarArchivo = async (url: string, params: Record<string, any>, nombreSugerido: string) => {
  const respuesta = await api.get(url, {
    params,
    responseType: 'blob', // clave: le decimos a Axios que espere datos binarios, no JSON
  });

  const blobUrl = window.URL.createObjectURL(new Blob([respuesta.data]));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = nombreSugerido;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const descargarReporteVentas = (formato: FormatoReporte, filtros: FiltrosFecha = {}) =>
  descargarArchivo('/reportes/ventas', { formato, ...filtros }, `reporte_ventas.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);

export const descargarReporteClientes = (formato: FormatoReporte) =>
  descargarArchivo('/reportes/clientes', { formato }, `reporte_clientes.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);

export const descargarReporteCreditos = (formato: FormatoReporte, estado?: string) =>
  descargarArchivo('/reportes/creditos', { formato, estado }, `reporte_creditos.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);

export const descargarReportePagos = (formato: FormatoReporte, filtros: FiltrosFecha = {}) =>
  descargarArchivo('/reportes/pagos', { formato, ...filtros }, `reporte_pagos.${formato === 'pdf' ? 'pdf' : 'xlsx'}`);