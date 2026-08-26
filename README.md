# 🥇 Fiado Digital

Sistema de gestión de créditos ("fiados") para tiendas pequeñas. Digitaliza un proceso que tradicionalmente se lleva en cuadernos o chats de WhatsApp, dando control real sobre ventas, clientes, créditos y pagos, con dashboard en tiempo real, automatización de cobros y auditoría completa.

> Proyecto de portafolio full-stack enfocado en arquitectura backend real, seguridad, lógica de negocio y una interfaz de usuario cuidada — no un CRUD genérico de tutorial.

---

## 📸 Capturas de pantalla

> _Agregar aquí capturas del Login, Dashboard, Clientes, Ventas, Créditos y Auditoría una vez el deploy esté listo._

---

## 🎯 El problema que resuelve

Las tiendas de barrio en Latinoamérica manejan una práctica muy común: el **fiado** (vender a crédito informal a clientes de confianza). Esto normalmente se controla en un cuaderno físico o en notas de chat, lo que genera:

- Pérdida de control sobre cuánto debe cada cliente
- Imposibilidad de saber quién está en mora y hace cuánto
- Ningún historial auditable de ventas, pagos o cambios
- Nadie recuerda avisar a los clientes antes de que venza su plazo

**Fiado Digital** digitaliza todo ese proceso con control de acceso por roles, cálculo automático de crédito disponible, notificaciones automáticas en tiempo real, reportes exportables y un historial de auditoría completo.

---

## 🧱 Arquitectura general

Este es un monorepo con dos proyectos independientes que se comunican por HTTP/WebSocket:

```
Proyecto Fiado Digital/
├── backend/     → API REST (Node.js + Express + PostgreSQL + Socket.io)
├── frontend/    → SPA (Vue 3 + TypeScript + Pinia)
└── README.md    → este archivo
```

- **[📄 README del Backend](./backend/README.md)** — arquitectura, modelo de datos, roles y permisos, los 8 módulos, documentación completa de la API, decisiones de diseño, instalación.
- **[📄 README del Frontend](./frontend/README.md)** — arquitectura, estructura de carpetas, gestión de estado, routing, sistema de diseño, cada vista explicada, composables, instalación.

---

## 🛠️ Stack tecnológico (resumen)

| Capa | Tecnología |
|---|---|
| Backend | Node.js, Express, PostgreSQL, Sequelize, Socket.io, JWT, Nodemailer, node-cron |
| Frontend | Vue 3, TypeScript, Vite, Pinia, Vue Router, Axios, Chart.js, Socket.io-client |
| Reportes | ExcelJS, PDFKit |

Detalle completo de cada dependencia y por qué se eligió, en los README de cada carpeta.

---

## 📦 Módulos implementados

**Backend (8/8):**
1. Autenticación (JWT, roles, verificación de email, recuperar contraseña)
2. Clientes (CRUD con permisos diferenciados, soft delete)
3. Ventas (contado/fiado, transacciones, cálculo server-side)
4. Créditos y Pagos (crédito disponible real, mora calculada dinámicamente)
5. Dashboard (widgets, gráficos, tiempo real vía Socket.io)
6. Automatización (Cron Jobs: avisos de cobro, mora, resumen diario)
7. Reportes (exportación PDF/Excel)
8. Auditoría (historial inmutable de acciones sensibles)

**Frontend (equivalente completo + extras de UX):**
- Login, Registro y Verificación de email
- Layout con sidebar, header, modo oscuro y notificaciones en tiempo real
- Las 8 vistas correspondientes a cada módulo del backend
- Tabla avanzada reutilizable (ordenamiento por columna + paginación)

---

## ⚙️ Cómo correr el proyecto completo en local

Necesitas dos terminales (una para cada proyecto) y PostgreSQL instalado.

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev
# Corre en http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

Instrucciones detalladas de configuración (variables de entorno, base de datos, etc.) en el README de cada carpeta.

---

## 💡 Por qué este proyecto (para reclutadores)

Este no es un CRUD de ejemplo. Algunas decisiones concretas que reflejan pensamiento de ingeniería de software real:

- **Permisos diferenciados por acción, no por módulo** — un cajero puede crear clientes pero no modificar su límite de crédito, pensado explícitamente para reducir el riesgo de abuso interno.
- **Crédito disponible calculado en tiempo real** (límite − deuda pendiente), no solo contra el límite total — evita que un cliente endeudado siga fiando de más.
- **Soft delete + auditoría inmutable** en vez de borrado físico — preserva trazabilidad completa para un sistema que maneja dinero.
- **Transacciones de base de datos** en toda operación multi-tabla (venta + detalle + crédito, pago + actualización de saldo) — o se guarda todo, o no se guarda nada.
- **Cálculos financieros nunca confían en el cliente** — el total de una venta y la validación de saldo siempre se recalculan en el backend.
- **Tiempo real genuino** vía Socket.io — dashboard y notificaciones se actualizan solos, sin polling.

Más detalle de cada una de estas decisiones en el README del backend.

---

## 👤 Autor

**Ronny Villa**
GitHub: [@Ronnyvilla3021](https://github.com/Ronnyvilla3021)