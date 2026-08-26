# 🎨 Fiado Digital — Frontend

Interfaz de usuario (SPA) del sistema Fiado Digital, construida en Vue 3 + TypeScript, consumiendo la API del backend con autenticación JWT, actualizaciones en tiempo real vía Socket.io, y un sistema de permisos por rol reflejado en toda la UI.

> Este README documenta el frontend en profundidad. Para la visión general del proyecto (backend + frontend), ver el [README raíz](../README.md). Para el backend, ver [backend/README.md](../backend/README.md).

---

## 📋 Tabla de contenido

- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del frontend](#-arquitectura-del-frontend)
- [Gestión de estado (Pinia)](#-gestión-de-estado-pinia)
- [Enrutamiento y protección de rutas](#-enrutamiento-y-protección-de-rutas)
- [Comunicación con el backend](#-comunicación-con-el-backend)
- [Sistema de diseño](#-sistema-de-diseño)
- [Vistas y funcionalidades](#-vistas-y-funcionalidades)
- [Composables reutilizables](#-composables-reutilizables)
- [Permisos por rol en la interfaz](#-permisos-por-rol-en-la-interfaz)
- [Decisiones de diseño destacadas](#-decisiones-de-diseño-destacadas)
- [Instalación y configuración local](#-instalación-y-configuración-local)
- [Estado del proyecto](#-estado-del-proyecto)

---

## 🛠️ Stack tecnológico

| Tecnología | Uso |
|---|---|
| Vue 3 (Composition API) | Framework de UI, con `<script setup>` en todos los componentes |
| TypeScript | Tipado estático en toda la aplicación |
| Vite | Build tool y servidor de desarrollo |
| Pinia | Gestión de estado global |
| Vue Router | Enrutamiento SPA, con guards de autenticación |
| Axios | Cliente HTTP, con interceptores para token y manejo de 401 |
| Socket.io-client | Conexión en tiempo real con el backend |
| Chart.js + vue-chartjs | Gráficos del dashboard (barras y circular) |
| SCSS | Preprocesador de estilos, usado dentro de cada componente `.vue` |

### Por qué esta combinación
- **Vue 3 + Composition API**: sintaxis más cercana a funciones puras, mejor inferencia de tipos con TypeScript que la Options API.
- **Pinia sobre Vuex**: es el manejador de estado oficial recomendado para Vue 3, API más simple, soporte nativo de TypeScript sin configuración extra.
- **SFC (Single File Components)**: cada `.vue` contiene `<template>`, `<script setup lang="ts">` y `<style scoped lang="scss">` en un solo archivo — es la convención idiomática de Vue (a diferencia de Angular, que separa en 3 archivos), y `scoped` evita fugas de estilos entre componentes sin necesidad de convenciones manuales tipo BEM globales.

---

## 🏗️ Arquitectura del frontend

```
frontend/src/
├── assets/
│   └── styles/            # Estilos globales (si aplica)
├── components/
│   ├── AppLayout.vue       # Sidebar + header + modo oscuro + notificaciones (envuelve toda ruta privada)
│   ├── BaseModal.vue       # Modal genérico reutilizable (usa <Teleport>)
│   ├── NotificacionesCampana.vue
│   └── PaginacionControles.vue
├── composables/
│   └── useTablaAvanzada.ts # Ordenamiento + paginación reutilizable
├── router/
│   └── index.ts             # Definición de rutas + guard de autenticación
├── services/                # Una función por endpoint del backend (capa HTTP)
│   ├── api.ts                # Instancia de Axios con interceptores
│   ├── socket.ts              # Instancia de Socket.io-client
│   ├── authService.ts
│   ├── clienteService.ts
│   ├── ventaService.ts
│   ├── creditoService.ts
│   ├── dashboardService.ts
│   ├── notificacionService.ts
│   ├── reporteService.ts
│   └── auditoriaService.ts
├── stores/                   # Un store Pinia por dominio de datos
│   ├── authStore.ts
│   ├── clienteStore.ts
│   ├── ventaStore.ts
│   ├── creditoStore.ts
│   └── notificacionStore.ts
├── types/                     # Interfaces TypeScript compartidas
│   ├── Cliente.ts
│   ├── Venta.ts
│   ├── Credito.ts
│   ├── Dashboard.ts
│   ├── Notificacion.ts
│   └── Auditoria.ts
├── views/                      # Una vista por ruta/página completa
│   ├── LoginView.vue
│   ├── RegistroView.vue
│   ├── VerificarEmailView.vue
│   ├── DashboardView.vue
│   ├── ClientesView.vue
│   ├── VentasView.vue
│   ├── CreditosView.vue
│   ├── ReportesView.vue
│   └── AuditoriaView.vue
├── App.vue                     # Componente raíz (solo `<router-view>`)
├── main.ts                      # Punto de entrada: registra Pinia y Router
└── style.css                    # Reset global mínimo
```

### Por qué esta separación en capas

- **`services/`** nunca sabe nada de Vue — son funciones puras que llaman a la API. Esto hace que la lógica de red sea testeable de forma aislada y reutilizable desde cualquier componente o store.
- **`stores/`** son el único lugar que mantiene estado compartido entre vistas (ej. la lista de clientes, para que Ventas pueda reusarla sin volver a pedirla al backend).
- **`views/`** orquestan: piden datos a los stores, manejan el estado local de formularios/modales, y delegan el HTML repetido a `components/`.
- **`types/`** se importan tanto en `services/` como en `stores/` y `views/`, garantizando que la forma de los datos del backend esté tipada de punta a punta.

---

## 🗃️ Gestión de estado (Pinia)

Cada store sigue el mismo patrón: estado reactivo (`ref`), una acción `cargar...()` que llama al servicio correspondiente, y acciones de mutación (`crear`, `editar`, `eliminar`, etc.) que llaman al backend y luego refrescan el estado local.

| Store | Qué mantiene |
|---|---|
| `authStore` | Token JWT y datos del usuario logueado. Persistido en `localStorage` para sobrevivir recargas de página. Expone `esAdmin()`, `esSupervisor()`, `esCajero()`. |
| `clienteStore` | Lista de clientes cargada, con acciones CRUD |
| `ventaStore` | Lista de ventas, acción de registro |
| `creditoStore` | Lista de créditos (filtrable por estado), acción de pago |
| `notificacionStore` | Lista de notificaciones del usuario, contador de no leídas (`computed`), acciones marcar-leída / eliminar / agregar (para tiempo real) |

### Persistencia de sesión
`authStore` inicializa su estado leyendo `localStorage.getItem('token')` y `localStorage.getItem('usuario')` — así, si el usuario recarga la página o cierra y abre el navegador (dentro de las 8 horas de validez del JWT), la sesión sigue activa sin necesidad de loguearse de nuevo.

---

## 🧭 Enrutamiento y protección de rutas

`router/index.ts` define dos tipos de rutas:

- **Públicas** (`meta: { publica: true }`): `/login`, `/registro`, `/verificar-email/:token`
- **Privadas**: todas las demás, anidadas como `children` dentro de una ruta padre que renderiza `AppLayout.vue` (sidebar + header persistentes mientras solo cambia el contenido interno)

Un **guard global** (`router.beforeEach`) se ejecuta antes de cada navegación:
```ts
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const rutaPublica = to.meta.publica === true;

  if (!rutaPublica && !authStore.token) {
    next({ name: 'login' });          // sin sesión → al login
  } else if (to.name === 'login' && authStore.token) {
    next({ name: 'dashboard' });      // ya logueado → fuera del login
  } else {
    next();
  }
});
```

Todas las vistas usan **lazy loading** (`component: () => import('../views/...')`) — cada una se descarga solo cuando el usuario navega a ella, no todas de una vez al cargar la app.

---

## 🔌 Comunicación con el backend

### HTTP — Axios con interceptores (`services/api.ts`)
Una única instancia de Axios centraliza toda la comunicación:
- **Request interceptor**: agrega automáticamente `Authorization: Bearer <token>` a cada petición saliente, leyendo del `authStore`. Ningún servicio individual necesita preocuparse por esto.
- **Response interceptor**: si el backend responde `401` (token inválido o expirado), cierra la sesión automáticamente y redirige a `/login` — evita que la app quede en un estado inconsistente con un token muerto.

### Tiempo real — Socket.io (`services/socket.ts`)
Una instancia compartida de `socket.io-client`, configurada con `autoConnect: false` — la conexión se abre manualmente (`socket.connect()`) solo cuando un componente que la necesita se monta (Dashboard, campanita de notificaciones), y se cierra (`socket.disconnect()`) cuando se desmonta, para no dejar conexiones abiertas innecesariamente.

Eventos escuchados:
| Evento | Dónde se usa | Efecto |
|---|---|---|
| `nueva-venta` | `DashboardView` | Recarga silenciosa de widgets y gráficos |
| `nuevo-pago` | `DashboardView` | Recarga silenciosa de widgets y gráficos |
| `nueva-notificacion` | `NotificacionesCampana` | Inserta la notificación al inicio de la lista en vivo |

---

## 🎨 Sistema de diseño

- **Variables CSS por tema**, definidas en `AppLayout.vue` y heredadas por todo el árbol de componentes (las variables CSS atraviesan `<style scoped>` sin problema, a diferencia de las clases):
  ```scss
  .app-layout {
    --color-fondo-tarjeta: #ffffff;
    --color-borde: rgba(0, 0, 0, 0.08);
    --color-texto-secundario: #6b7280;
    --color-input-fondo: #ffffff;

    &--oscuro {
      --color-fondo-tarjeta: #1c1f26;
      --color-borde: rgba(255, 255, 255, 0.08);
      /* ... */
    }
  }
  ```
  Cualquier vista que use `background: var(--color-fondo-tarjeta)` se adapta automáticamente al modo oscuro sin lógica adicional.

- **Modo oscuro persistente**: guardado en `localStorage`, se restaura al recargar la página.

- **Paleta de acento**: `#6c5ce7` (morado, color primario de marca), `#e17055` (rojo/naranja, error y acciones destructivas), `#00b894` (verde, éxito/confirmación), `#0984e3` (azul, informativo).

- **Clases utilitarias compartidas entre vistas**: `.btn` / `.btn-primary` / `.btn-outline` / `.btn-success` / `.btn-sm`, `.form-control` / `.form-group`, `.table` / `.table-wrapper`, `.badge` (con modificadores `--activo`, `--pendiente`, `--vencido`, etc. definidos localmente por cada vista según los estados que maneja).

---

## 🖥️ Vistas y funcionalidades

### `LoginView.vue`
Formulario de email/contraseña. Al autenticar, guarda sesión en `authStore` y redirige al Dashboard. Incluye link a Registro.

### `RegistroView.vue`
Registro público (siempre crea usuarios con rol `cajero` — el backend no permite auto-asignarse un rol privilegiado). Tras el registro exitoso, muestra un mensaje pidiendo verificar el correo, sin redirigir automáticamente al login.

### `VerificarEmailView.vue`
Lee el `:token` de la URL (el mismo link que llega por correo), lo valida contra el backend al montarse, y muestra éxito o error con un botón de vuelta al login.

### `AppLayout.vue` *(no es una vista, es el contenedor de las vistas privadas)*
- Sidebar con navegación (los links de Reportes y Auditoría solo se renderizan si el rol del usuario lo permite, vía `v-if="authStore.esAdmin()"` etc.)
- Header con: campanita de notificaciones, botón de modo oscuro, nombre/rol del usuario, botón de cerrar sesión
- El símbolo de ruta activa se resalta automáticamente gracias a la clase `.router-link-active` que Vue Router aplica solo

### `DashboardView.vue`
- 4 widgets (ventas hoy, clientes morosos, crédito activo, pagos recibidos hoy)
- Gráfico de barras (ventas últimos 7 días) y gráfico circular (contado vs. fiado), con Chart.js
- Tabla de clientes en mora con detalle
- Se conecta a Socket.io al montarse y se desconecta al desmontarse; los eventos `nueva-venta`/`nuevo-pago` disparan una recarga silenciosa (sin mostrar el spinner de carga, para que se sienta fluido)

### `ClientesView.vue`
- Tabla con búsqueda en vivo (debounce de 400ms para no saturar al backend con cada tecla)
- Modal de creación/edición: el campo de límite de crédito solo aparece si el usuario es admin o supervisor (refleja en la UI la misma regla que ya protege el backend)
- Los campos opcionales vacíos (`teléfono`, `dirección`, `email`) se convierten a `null` antes de enviarse — evita romper validaciones del backend como `isEmail` sobre un string vacío
- Botones de desactivar / reactivar (soft delete), visibles solo para admin
- Ordenamiento por columnas + paginación (ver [Composables](#-composables-reutilizables))

### `VentasView.vue`
- Modal con selector de método de pago (contado/fiado) tipo toggle
- El selector de cliente y plazo de días solo aparece si el método es "fiado"
- Ítems de venta dinámicos (agregar/quitar filas), con cálculo de subtotal y total **en vivo** vía `computed()` — aunque el backend recalcula el total de forma independiente y nunca confía en lo que mande el frontend
- Solo se listan clientes con estado `activo` en el selector

### `CreditosView.vue`
- Filtros por estado (Todos / Pendientes / Vencidos / Pagados), leídos también desde el query param de la URL (`?estado=vencido`) para permitir enlaces directos desde las notificaciones
- Modal de pago con el saldo pendiente pre-cargado (editable para abonos parciales)
- Columna de días de mora, calculada por el backend

### `ReportesView.vue`
- Una tarjeta por tipo de reporte (Ventas, Clientes, Créditos, Pagos), cada una con sus filtros propios (fechas o estado) y botones de descarga en Excel/PDF
- Descarga implementada con `responseType: 'blob'` en Axios — construye un link temporal en memoria y dispara la descarga del navegador, totalmente autenticado (a diferencia de abrir la URL directo en una pestaña, que no llevaría el token)

### `AuditoriaView.vue`
- Vista de solo lectura, solo accesible para administrador
- Presentada como línea de tiempo (no tabla), con un ícono distinto según el tipo de acción
- Filtros por entidad y por tipo de acción
- Renderiza inteligentemente el campo `detalles`: si tiene la forma `{ antes, despues }`, lo muestra como `campo: valor_anterior → valor_nuevo`

### `NotificacionesCampana.vue` *(componente, vive en el header)*
- Badge con el conteo de notificaciones no leídas (`computed` sobre el store)
- Panel desplegable, se cierra al hacer click fuera
- Navegación contextual: al hacer click en una notificación de tipo `mora` o `cobro_pendiente`, redirige a `/creditos` con el filtro de estado correspondiente ya aplicado; las de tipo `resumen_diario` solo se marcan como leídas
- Botón de eliminar por notificación (aparece al hacer hover), separado del click de "marcar leída" con `@click.stop`

---

## 🧩 Composables reutilizables

### `useTablaAvanzada.ts`
Función genérica (`<T extends Record<string, any>>`) usada por `ClientesView`, `VentasView` y `CreditosView` para no duplicar lógica de tabla tres veces. Recibe una referencia reactiva a un array de datos y devuelve:
- `datosPaginados`: el slice de datos que corresponde a la página actual, ya ordenados
- `cambiarOrden(columna)`: si se hace click en la misma columna dos veces, invierte la dirección; si es una columna nueva, empieza ascendente
- `iconoOrden(columna)`: `↕` / `↑` / `↓` según el estado de orden de esa columna
- `paginaActual`, `totalPaginas`, `irAPagina(n)`

El ordenamiento y la paginación se resuelven **en el frontend**, sobre los datos ya cargados — decisión consciente dado el volumen de datos manejable de este proyecto; para un dataset mucho más grande, este mismo composable podría adaptarse para pedir páginas al backend en su lugar.

### `PaginacionControles.vue`
Componente de presentación puro (botones Anterior/Siguiente + indicador de página), reutilizado junto con el composable anterior en las 3 vistas con tabla.

---

## 🔐 Permisos por rol en la interfaz

La UI refleja exactamente las mismas reglas de permisos que ya protegen el backend — **nunca como único mecanismo de seguridad**, sino como mejora de experiencia (evitar mostrar botones que de todas formas el backend rechazaría):

| Elemento de UI | Condición |
|---|---|
| Link "Reportes" en sidebar | `authStore.esAdmin() \|\| authStore.esSupervisor()` |
| Link "Auditoría" en sidebar | `authStore.esAdmin()` |
| Campo "Límite de crédito" en modal de cliente | `authStore.esAdmin() \|\| authStore.esSupervisor()` |
| Botón "Desactivar" / "Reactivar" cliente | `authStore.esAdmin()` |

---

## 💡 Decisiones de diseño destacadas

1. **Interceptores de Axios centralizados** en vez de repetir headers en cada servicio — un solo lugar controla autenticación y manejo de sesión expirada para toda la app.
2. **Socket conectado/desconectado por ciclo de vida del componente** (`onMounted`/`onUnmounted`), nunca de forma global — evita conexiones WebSocket huérfanas al navegar entre vistas.
3. **Variables CSS en vez de props de tema**: permiten que el modo oscuro se propague a componentes hijos sin que cada uno tenga que recibir y reenviar un prop `oscuro`.
4. **Conversión de strings vacíos a `null`** antes de enviar formularios — un formulario HTML nunca distingue "el usuario no llenó esto" de "el usuario lo dejó como texto vacío", pero el backend sí necesita esa distinción para sus validaciones (`allowNull: true` no acepta `''` en un campo con validación `isEmail`).
5. **Filtro de créditos also leído desde el query param** — permite que un link de notificación (`/creditos?estado=vencido`) abra la vista ya filtrada, en vez de requerir que el usuario aplique el filtro manualmente después de navegar.
6. **Descarga de reportes vía blob + Axios**, no un link directo a la API — necesario porque la ruta requiere autenticación por header, algo que un simple `<a href="...">` no puede enviar.

---

## ⚙️ Instalación y configuración local

### Requisitos previos
- Node.js v18+
- El backend corriendo en `http://localhost:5000` (ver [backend/README.md](../backend/README.md))

### Pasos

```bash
cd frontend
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

> La URL del backend está hardcodeada en `services/api.ts` y `services/socket.ts` como `http://localhost:5000`. Para apuntar a otro entorno (ej. producción), se recomienda migrar esto a una variable de entorno de Vite (`import.meta.env.VITE_API_URL`).

---

## 📌 Estado del proyecto

**Frontend: completo**

- [x] Setup base (Vue 3 + TS + Pinia + Router + Axios)
- [x] Login, Registro, Verificación de email
- [x] Layout general (sidebar, header, modo oscuro, permisos por rol)
- [x] Módulo de Clientes (CRUD + tabla avanzada)
- [x] Módulo de Ventas (ítems dinámicos + tabla avanzada)
- [x] Módulo de Créditos y Pagos (filtros + tabla avanzada)
- [x] Dashboard (widgets, gráficos, tiempo real)
- [x] Reportes (descarga PDF/Excel)
- [x] Notificaciones (tiempo real, navegación contextual, borrado)
- [x] Auditoría (línea de tiempo con filtros)
- [x] Tabla avanzada reutilizable (ordenamiento + paginación)

**Pendiente**
- [ ] Deploy (Netlify / Vercel)
- [ ] Migrar URLs hardcodeadas del backend a variables de entorno de Vite

Ver el [README del backend](../backend/README.md) para la documentación de la API que este frontend consume.

---

## 👤 Autor

**Ronny Villa**
GitHub: [@Ronnyvilla3021](https://github.com/Ronnyvilla3021)