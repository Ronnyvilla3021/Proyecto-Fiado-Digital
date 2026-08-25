import { ref, computed, type Ref } from 'vue';

type Direccion = 'asc' | 'desc';

export function useTablaAvanzada<T extends Record<string, any>>(
  datos: Ref<T[]>,
  porPagina = 8
) {
  const columnaOrden = ref<string | null>(null);
  const direccionOrden = ref<Direccion>('asc');
  const paginaActual = ref(1);

  const cambiarOrden = (columna: string) => {
    if (columnaOrden.value === columna) {
      direccionOrden.value = direccionOrden.value === 'asc' ? 'desc' : 'asc';
    } else {
      columnaOrden.value = columna;
      direccionOrden.value = 'asc';
    }
    paginaActual.value = 1; // al reordenar, volvemos a la primera página
  };

  const datosOrdenados = computed(() => {
    if (!columnaOrden.value) return datos.value;

    const columna = columnaOrden.value;
    const factor = direccionOrden.value === 'asc' ? 1 : -1;

    return [...datos.value].sort((a, b) => {
      const valorA = a[columna];
      const valorB = b[columna];

      if (valorA === null || valorA === undefined) return 1;
      if (valorB === null || valorB === undefined) return -1;

      if (typeof valorA === 'number' || typeof valorB === 'number') {
        return (Number(valorA) - Number(valorB)) * factor;
      }

      return String(valorA).localeCompare(String(valorB)) * factor;
    });
  });

  // Si los datos cambian (nueva búsqueda, nuevo filtro) y la página actual
  // queda fuera de rango, la corregimos automáticamente.
  const totalPaginas = computed(() =>
    Math.max(1, Math.ceil(datosOrdenados.value.length / porPagina))
  );

  const datosPaginados = computed(() => {
    if (paginaActual.value > totalPaginas.value) {
      paginaActual.value = totalPaginas.value;
    }
    const inicio = (paginaActual.value - 1) * porPagina;
    return datosOrdenados.value.slice(inicio, inicio + porPagina);
  });

  const irAPagina = (pagina: number) => {
    if (pagina < 1 || pagina > totalPaginas.value) return;
    paginaActual.value = pagina;
  };

  const iconoOrden = (columna: string) => {
    if (columnaOrden.value !== columna) return '↕';
    return direccionOrden.value === 'asc' ? '↑' : '↓';
  };

  return {
    paginaActual,
    totalPaginas,
    datosPaginados,
    cambiarOrden,
    irAPagina,
    iconoOrden,
  };
}