# 🥇 Fiado Digital

Sistema de gestión de créditos ("fiados") para tiendas pequeñas. Digitaliza un proceso que tradicionalmente se lleva en cuadernos o chats de WhatsApp, dando control real sobre ventas, clientes, créditos y pagos, con dashboard en tiempo real y automatización de cobros.

> Proyecto de portafolio enfocado en arquitectura backend real, seguridad y lógica de negocio — no solo un CRUD genérico.

---

## 📋 Tabla de contenido

- [El problema que resuelve](#-el-problema-que-resuelve)
- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura del backend](#-arquitectura-del-backend)
- [Modelo de datos](#-modelo-de-datos)
- [Roles y permisos](#-roles-y-permisos)
- [Módulos y funcionalidades](#-módulos-y-funcionalidades)
- [Documentación de la API](#-documentación-de-la-api)
- [Decisiones de diseño destacadas](#-decisiones-de-diseño-destacadas)
- [Instalación y configuración local](#-instalación-y-configuración-local)
- [Variables de entorno](#-variables-de-entorno)
- [Estado del proyecto](#-estado-del-proyecto)

---

## 🎯 El problema que resuelve

Las tiendas de barrio en Latinoamérica manejan una práctica muy común: el **fiado** (vender a crédito informal a clientes de confianza). Esto normalmente se controla en un cuaderno físico o en notas de chat, lo que genera:

- Pérdida de control sobre cuánto debe cada cliente
- Imposibilidad de saber quién está en mora y hace cuánto
- Ningún historial auditable de ventas, pagos o cambios
- Nadie recuerda avisar a los clientes antes de que venza su plazo

**Fiado Digital** digitaliza todo ese proceso con control de acceso por roles, cálculo automático de crédito disponible, notificaciones automáticas y reportes exportables.

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|---|---|
| Runtime | Node.js |
| Framework backend | Express.js |
| Base de datos | PostgreSQL |
| ORM | Sequelize |
| Tiempo real | Socket.io |
| Autenticación | JWT + bcryptjs |
| Automatización | node-cron |
| Email | Nodemailer (Gmail) |
| Reportes | ExcelJS + PDFKit |
| Testing manual de API | Thunder Client |
| Frontend (en desarrollo) | Vue 3 + Vite |

---

## 🏗️ Arquitectura del backend

```
backend/
├── config/
│   ├── database.js        # Conexión Sequelize a PostgreSQL
│   └── mailer.js           # Servicio de envío de emails (Nodemailer)
├── controllers/
│   ├── authController.js
│   ├── clienteController.js
│   ├── ventaController.js
│   ├── creditoController.js
│   ├── dashboardController.js
│   ├── notificacionController.js
│   ├── reporteController.js
│   └── reportes/
│       ├── excelHelper.js  # Generador genérico de Excel
│       └── pdfHelper.js    # Generador genérico de PDF
├── jobs/
│   ├── avisarCobrosPendientes.js
│   ├── avisarMora.js
│   ├── resumenDiario.js
│   └── scheduler.js        # Programación de los cron jobs
├── middlewares/
│   └── authMiddleware.js   # verificarToken + verificarRol
├── models/
│   ├── Usuario.js
│   ├── Cliente.js
│   ├── Venta.js
│   ├── DetalleVenta.js
│   ├── Credito.js
│   ├── Pago.js
│   ├── Notificacion.js
│   └── associations.js     # Todas las relaciones entre modelos
├── routes/
│   ├── authRoutes.js
│   ├── clienteRoutes.js
│   ├── ventaRoutes.js
│   ├── creditoRoutes.js
│   ├── dashboardRoutes.js
│   ├── notificacionRoutes.js
│   └── reporteRoutes.js
├── .env                     # Variables de entorno (no versionado)
└── index.js                 # Punto de entrada: Express + Socket.io + Sequelize
```

### Patrón de capas

Cada módulo sigue el mismo flujo: **Ruta → Middleware de auth/rol → Controlador → Modelo (Sequelize) → PostgreSQL**. Los controladores nunca acceden a la base de datos directamente sin pasar por los modelos, y las rutas nunca contienen lógica de negocio.

---

## 🗄️ Modelo de datos

**6 tablas principales**, todas relacionadas mediante llaves foráneas gestionadas por Sequelize:

```
usuarios ──┬──< ventas >──── clientes
           │       │              │
           │       └──< detalle_ventas
           │       │
           │       └──── creditos ────< pagos
           │                              │
           └──────────────────────────────┘
           └──< notificaciones
```

- **usuarios**: cuentas del sistema (administrador, cajero, supervisor)
- **clientes**: personas a quienes se les puede fiar
- **ventas**: cabecera de cada venta (contado o fiada)
- **detalle_ventas**: ítems individuales de cada venta
- **creditos**: se generan automáticamente al registrar una venta fiada
- **pagos**: abonos registrados contra un crédito
- **notificaciones**: alertas internas generadas por los cron jobs

---

## 🔐 Roles y permisos

El sistema tiene 3 roles con permisos diferenciados **por acción**, no solo por módulo — diseñado explícitamente para prevenir abuso de confianza interno (ej. que un cajero suba límites de crédito a cambio de favores):

| Acción | Administrador | Supervisor | Cajero |
|---|:---:|:---:|:---:|
| Registrar ventas / pagos | ✅ | ✅ | ✅ |
| Crear / editar clientes (datos generales) | ✅ | ✅ | ✅ |
| Editar límite de crédito de un cliente | ✅ | ✅ | ❌ |
| Eliminar cliente (soft delete) | ✅ | ❌ | ❌ |
| Ver dashboard | ✅ | ✅ | ✅ |
| Ver reportes (PDF/Excel) | ✅ | ✅ | ❌ |
| Ejecutar jobs de automatización manualmente | ✅ | ❌ | ❌ |

Todos los permisos están validados en el **backend** mediante middlewares (`verificarToken`, `verificarRol`), no solo ocultos en el frontend — un usuario no puede saltarse las reglas manipulando la petición.

---

## 📦 Módulos y funcionalidades

### 1. Autenticación
- Registro con contraseña encriptada (bcrypt, salt rounds 10)
- Verificación de cuenta por email (token de un solo uso)
- Login bloqueado si el email no está verificado
- JWT con expiración de 8 horas
- Recuperación de contraseña con token temporal (expira en 1 hora)
- La respuesta de "recuperar contraseña" es idéntica exista o no el email registrado, para no filtrar información de qué correos están en el sistema

### 2. Clientes
- CRUD completo con búsqueda por nombre, apellido o cédula
- Eliminación mediante **soft delete** (campo `estado`), nunca se borra un registro físicamente — preserva el historial de ventas/créditos para auditoría
- Validación de cédula única

### 3. Ventas
- Venta al contado (sin cliente obligatorio) o fiada (cliente obligatorio)
- El total se calcula siempre en el **backend** a partir de los ítems — nunca se confía en un total enviado desde el cliente
- Uso de **transacciones de base de datos**: si falla cualquier paso (venta, detalle, crédito), se revierte todo con `rollback()`, nunca queda una venta a medias
- Una venta fiada valida el **crédito disponible real** del cliente (ver sección de decisiones de diseño)

### 4. Créditos y pagos
- Un crédito se genera **automáticamente** al registrar una venta fiada — no existe una ruta para crearlo manualmente, evitando ventas fiadas sin control
- `dias_mora` y el estado `vencido` se **calculan dinámicamente** en cada consulta comparando la fecha límite con la fecha actual, nunca se guardan como valores fijos que puedan desactualizarse
- Un pago no puede superar el saldo pendiente del crédito
- Actualización automática del estado a `pagado` cuando el saldo llega a 0

### 5. Dashboard + tiempo real
- Widgets: ventas del día, clientes morosos, crédito activo total, pagos recibidos hoy
- Gráficos: ventas de los últimos 7 días (barras), distribución contado vs. fiado (circular)
- **Socket.io**: cualquier venta o pago nuevo emite un evento en tiempo real (`nueva-venta`, `nuevo-pago`) que el frontend puede escuchar para refrescar el dashboard sin recargar la página

### 6. Automatización (Cron Jobs)
- **Avisar cobros pendientes**: todos los días a las 8:00 AM, revisa créditos que vencen en los próximos 3 días y notifica por email al cliente + notificación interna a administradores
- **Avisar mora**: todos los días a las 9:00 AM, revisa créditos vencidos y no pagados
- **Resumen diario**: todos los días a las 8:00 PM, envía a los administradores un correo con el total de ventas y pagos del día
- Los 3 jobs también se pueden **ejecutar manualmente** vía endpoint protegido (útil para un botón de "forzar ahora" en el panel de admin)

### 7. Reportes
- 4 tipos: ventas, clientes, créditos, pagos
- Exportables en **Excel** (.xlsx) o **PDF**, mediante el mismo endpoint con el parámetro `?formato=pdf`
- Generadores reutilizables (`excelHelper.js`, `pdfHelper.js`) que reciben columnas y filas genéricas — evita duplicar lógica de exportación 4 veces
- Filtros opcionales por rango de fechas (`?desde=&hasta=`) y por estado (créditos)
- Acceso restringido a administrador y supervisor (información financiera sensible)

---

## 📡 Documentación de la API

Todas las rutas (excepto registro/login) requieren el header:
```
Authorization: Bearer <token>
```

### Auth — `/auth`
| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| POST | `/auth/registro` | Registrar usuario | Público |
| POST | `/auth/login` | Iniciar sesión | Público |
| GET | `/auth/verificar-email/:token` | Verificar cuenta | Público |
| POST | `/auth/recuperar-password` | Solicitar recuperación | Público |
| POST | `/auth/restablecer-password/:token` | Cambiar contraseña | Público |
| GET | `/auth/perfil` | Datos del usuario autenticado | Autenticado |

### Clientes — `/clientes`
| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| POST | `/clientes` | Crear cliente | Admin, Supervisor, Cajero |
| GET | `/clientes?busqueda=` | Listar / buscar clientes | Autenticado |
| GET | `/clientes/:id` | Ver un cliente | Autenticado |
| PUT | `/clientes/:id` | Editar cliente | Admin, Supervisor, Cajero* |
| DELETE | `/clientes/:id` | Eliminar (soft delete) | Admin |

*Editar `limite_credito` requiere Admin o Supervisor específicamente.

### Ventas — `/ventas`
| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| POST | `/ventas` | Registrar venta | Admin, Supervisor, Cajero |
| GET | `/ventas?cliente_id=&metodo_pago=` | Listar ventas | Autenticado |
| GET | `/ventas/:id` | Ver una venta | Autenticado |

### Créditos — `/creditos`
| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/creditos?cliente_id=&estado=` | Listar créditos | Autenticado |
| GET | `/creditos/:id` | Ver un crédito con pagos | Autenticado |
| POST | `/creditos/pagos` | Registrar pago | Admin, Supervisor, Cajero |

### Dashboard — `/dashboard`
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/dashboard` | Widgets generales |
| GET | `/dashboard/grafico-ventas-semana` | Ventas últimos 7 días |
| GET | `/dashboard/grafico-metodo-pago` | Distribución contado/fiado |

### Notificaciones — `/notificaciones`
| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/notificaciones` | Listar mis notificaciones | Autenticado |
| PUT | `/notificaciones/:id/leer` | Marcar como leída | Autenticado |
| POST | `/notificaciones/ejecutar/cobros-pendientes` | Forzar job | Admin |
| POST | `/notificaciones/ejecutar/mora` | Forzar job | Admin |
| POST | `/notificaciones/ejecutar/resumen-diario` | Forzar job | Admin |

### Reportes — `/reportes`
| Método | Ruta | Descripción | Rol requerido |
|---|---|---|---|
| GET | `/reportes/ventas?formato=&desde=&hasta=` | Reporte de ventas | Admin, Supervisor |
| GET | `/reportes/clientes?formato=` | Reporte de clientes | Admin, Supervisor |
| GET | `/reportes/creditos?formato=&estado=` | Reporte de créditos | Admin, Supervisor |
| GET | `/reportes/pagos?formato=&desde=&hasta=` | Reporte de pagos | Admin, Supervisor |

`formato` acepta `excel` (default) o `pdf`.

### Eventos de Socket.io
| Evento | Cuándo se emite | Payload |
|---|---|---|
| `nueva-venta` | Al registrar cualquier venta | `{ venta, metodo_pago }` |
| `nuevo-pago` | Al registrar cualquier pago | `{ pago, credito }` |
| `nueva-notificacion` | Al generarse una notificación interna | Objeto `Notificacion` |

---

## 💡 Decisiones de diseño destacadas

Estos son puntos que reflejan pensamiento de negocio más allá de un CRUD básico:

1. **Crédito disponible real, no solo límite total**: al registrar una venta fiada, el sistema no compara contra el `limite_credito` completo del cliente, sino contra `limite_credito - suma de saldos de créditos no pagados`. Así se evita que un cliente que ya debe $90 de un límite de $100 pueda seguir fiando libremente.

2. **Permisos diferenciados por acción, no por módulo**: en vez de "solo admin puede tocar clientes", se definió permiso por campo sensible (ej. límite de crédito) — pensado específicamente para reducir el riesgo de abuso interno ("metida de mano") sin frenar la operación diaria de un cajero.

3. **Soft delete en vez de DELETE físico**: ningún registro de cliente se borra realmente de la base de datos; se marca como `inactivo`. Esto preserva el historial completo de ventas y créditos para auditoría, incluso después de "eliminar" un cliente.

4. **`dias_mora` y estados calculados dinámicamente**: en vez de guardar un campo `dias_mora` que requeriría actualizarse constantemente (y podría desincronizarse), se calcula al vuelo en cada consulta comparando fechas. Fuente de verdad única, sin duplicación de datos.

5. **Transacciones de base de datos en operaciones multi-tabla**: registrar una venta implica escribir en `ventas`, `detalle_ventas` y potencialmente `creditos`. Todo ocurre dentro de una transacción Sequelize — si algo falla a mitad de camino, se revierte completo, nunca queda un registro parcial.

6. **El total de una venta se calcula en el servidor**: nunca se confía en un total enviado desde el cliente/frontend, para prevenir manipulación de precios desde una petición HTTP directa.

7. **Respuestas simétricas en recuperación de contraseña**: el endpoint de "olvidé mi contraseña" responde exactamente igual exista o no el email en el sistema, evitando que alguien use ese endpoint para enumerar qué correos están registrados.

---

## ⚙️ Instalación y configuración local

### Requisitos previos
- Node.js v18+
- PostgreSQL 16+
- Una cuenta de Gmail con contraseña de aplicación (para envío de emails)

### Pasos

```bash
# Clonar el repositorio
git clone https://github.com/Ronnyvilla3021/Proyecto-Fiado-Digital.git
cd Proyecto-Fiado-Digital/backend

# Instalar dependencias
npm install

# Crear la base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE fiado_digital;"

# Configurar variables de entorno (ver sección siguiente)
cp .env.example .env

# Levantar el servidor en modo desarrollo
npm run dev
```

El servidor queda disponible en `http://localhost:5000`. Sequelize sincroniza automáticamente las tablas al iniciar (`sequelize.sync()`).

---

## 🔑 Variables de entorno

Crea un archivo `.env` en `backend/` con las siguientes variables:

```env
PORT=5000
DB_NAME=fiado_digital
DB_USER=postgres
DB_PASSWORD=tu_contraseña_de_postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=una_frase_secreta_larga_y_dificil_de_adivinar
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASSWORD=contraseña_de_aplicacion_de_16_caracteres
FRONTEND_URL=http://localhost:5173
```

> ⚠️ `EMAIL_PASSWORD` debe ser una [contraseña de aplicación de Google](https://myaccount.google.com/apppasswords), no la contraseña normal de la cuenta. Requiere verificación en 2 pasos activada.

---

## 📌 Estado del proyecto

**Backend: completo (7/7 módulos)**

- [x] Módulo 1 — Autenticación
- [x] Módulo 2 — Clientes
- [x] Módulo 3 — Ventas
- [x] Módulo 4 — Créditos y Pagos
- [x] Módulo 5 — Dashboard + Socket.io
- [x] Módulo 6 — Automatización (Cron Jobs)
- [x] Módulo 7 — Reportes (PDF/Excel)

**Frontend: en desarrollo**

- [ ] Setup Vue 3 + Vite + Router + Pinia
- [ ] Login / Registro
- [ ] Vistas de Clientes, Ventas, Créditos
- [ ] Dashboard con gráficos y tiempo real
- [ ] Modo oscuro, tabla avanzada, auditoría

**Pendiente para producción**
- [ ] Deploy backend (Render / Railway)
- [ ] Deploy frontend (Netlify / Vercel)
- [ ] Deploy base de datos PostgreSQL en la nube

---

## 👤 Autor

**Ronny Villa**
GitHub: [@Ronnyvilla3021](https://github.com/Ronnyvilla3021)