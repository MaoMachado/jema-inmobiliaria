# CONTEXT.md — Lenguaje ubicuo y contexto de dominio

> Documento vivo. Fuente de verdad del **lenguaje ubicuo** de Jema Inmobiliaria.
> Si un término no está aquí, se define aquí antes de usarlo en código, tickets o ADRs.
> Última revisión: 2026-10-09 · Deriva del código en `apps/backend` y `apps/frontend`, no de suposiciones.

---

## 1. Propósito del producto

Plataforma inmobiliaria colombiana para **crear, consultar y mostrar** inmuebles (terrenos, vivienda, etc.),
con **IA integrada** para asesoría y estimaciones. Monetiza mediante **planes de suscripción** que amplían
límites de publicación y consultas de IA, y mediante **propiedades destacadas**.

El sistema conecta a **propietarios** (publican) con **interesados** (consultan) y cuenta con un **equipo
administrador** que modera publicaciones, verifica identidad y gestiona reportes de fraude.

---

## 2. Alcance y arquitectura (lo que existe hoy)

| Pieza | Ruta | Rol |
|---|---|---|
| Frontend | `apps/frontend` | Next.js 16 (App Router) + React 19 + Tailwind 4. Consume la API por REST. |
| Backend | `apps/backend` | NestJS 11 + Prisma 7 sobre PostgreSQL. Expone la API en `:3001`. |
| Storage | Supabase Storage | Solo almacenamiento de archivos (fotos, documentos, comprobantes). |

**Decisión de hecho (drift respecto a docs):** a pesar de lo que dicen `README.md` y `AGENTS.md`,
**la autenticación NO es Supabase Auth** sino JWT propio (NestJS `@nestjs/jwt` + `bcryptjs`), y
**NO hay RLS**: la autorización vive en el backend (guards `JwtAuthGuard`/`RolesGuard` + chequeos de
propiedad del recurso en los servicios). Supabase se usa únicamente como **Storage**. Ver §9.

---

## 3. Lenguaje ubicuo (glosario canónico)

Usa **exactamente** estos términos. La columna "Evitar" lista sinónimos que NO deben aparecer en código ni tickets.

| Término canónico | Definición | Evitar |
|---|---|---|
| **Usuario** | Persona registrada. Entidad `Usuario`. | "user" en el dominio (solo en tipos de infraestructura) |
| **Propietario / Publicador** | `Usuario` que creó una `Propiedad` (`publicadoPorId`). | "dueño" como sinónimo de propietario del inmueble |
| **Propiedad** | Inmueble publicado. Entidad `Propiedad`. | "inmueble", "listing", "publicación" (ver nota) |
| **Publicación** | El *acto* de crear/publicar una `Propiedad` y su ciclo de aprobación. No es una entidad. | usar "publicación" como sinónimo de `Propiedad` |
| **Documento de propiedad** | Archivo de respaldo de una `Propiedad` (`DocumentoPropiedad`). | "anexo", "adjunto" |
| **Documento de usuario** | Documento de identidad del `Usuario` (`documentoUrl`). | "cédula" en código |
| **Reporte de fraude** | Denuncia sobre una `Propiedad` (`ReporteFraude`). | "denuncia", "queja" |
| **Puntaje** | Métrica 0–100 de **completitud de la publicación** (`Propiedad.puntaje`). | "score", "rating", "calificación" |
| **Estimación** | Conjunto de métricas predictivas de una `Propiedad` (venta, ocupación, canon, etc.). | "predicción", "avalúo" |
| **Canon** | Arriendo mensual sugerido (`canonEsperado`). | "renta", "alquiler" |
| **Propiedad destacada** | `Propiedad` priorizada en portada; requiere plan PREMIUM. | "featured", "promocionada" |
| **Plan** | Nivel de suscripción: `GRATIS`, `BASICO`, `PREMIUM`. | "suscripción" como enum |
| **Pago** | Solicitud de cambio de plan con comprobante (`Pago`). | "transacción", "factura" |
| **Comprobante** | Archivo de respaldo del `Pago`. | "recibo", "voucher" |
| **Código OTP** | Código SMS de 6 dígitos para verificar celular (`CodigoOt`). | "token", "PIN" (salvo en UI) |
| **Verificación** | Actos de confirmar identidad: `celularVerificado` (OTP) y `documentoVerificado` (manual). | "validación" |
| **Asesor IA** | Chat de Gemini que orienta usando el catálogo aprobado. | "bot", "asistente" |

> Nota de precisión: en UI puede decirse "inmueble" o "publicación" por cercanía al usuario, pero en **código,
> tests, tickets y ADRs** el término es **Propiedad**.

---

## 4. Modelo de dominio

### Entidades y relaciones

- **Usuario** 1—N **Propiedad** (como `publicadoPor`)
- **Usuario** 1—N **Pago**, 1—N **CodigoOt**, 1—N **ReporteFraude** (como `creadoPor`)
- **Propiedad** 1—N **DocumentoPropiedad** (borrado en cascada), 1—N **ReporteFraude**

### Enumeraciones (nombres y valores exactos)

| Enum | Valores | Significado |
|---|---|---|
| `Role` | `USER`, `ADMIN` | Rol de acceso. |
| `EstadoPropiedad` | `PENDIENTE`, `APROBADA`, `RECHAZADA` | Ciclo de moderación de la Propiedad. |
| `EstadoPago` | `PENDIENTE`, `APROBADO`, `RECHAZADO` | Ciclo de revisión del Pago. |
| `Plan` | `GRATIS`, `BASICO`, `PREMIUM` | Nivel de suscripción. |
| `EstadoReporte` | `ABIERTO`, `RESUELTO`, `IGNORADO` | Gestión del Reporte de fraude. |

### Campos clave de `Propiedad`

`titulo`, `descripcion`, `precio` (COP), `ciudad`, `barrio`, `direccion`, `estrato`, `tipo`,
`habitaciones`, `banos`, `parqueaderos`, `area` (m²), `antiguedad` (años), `fotografias[]`, `video?`,
`ubicacionLat?`, `ubicacionLong?`, `puntaje?`, `estado`, `motivoRechazo?`, `destacada`, `destacadaHasta?`.

---

## 5. Reglas de negocio e invariantes

### Publicación y moderación
- Toda `Propiedad` **nace en `PENDIENTE`**; no es visible públicamente hasta `APROBADA`.
- **Editar** una `Propiedad` la **devuelve a `PENDIENTE`** (re-moderación obligatoria).
- Solo `ADMIN` aprueba (`APROBADA`) o rechaza (`RECHAZADA`, con `motivoRechazo`).
- `findOne` oculta propiedades no aprobadas a quien no sea propietario ni admin (devuelve 404).
- El **contacto** del publicador (email/celular) solo se entrega a `Usuario` autenticado.

### Límites por plan (`PLANES`, en `pagos/planes.ts`)

| Plan | Precio (COP) | Propiedades | Chat IA/día | Fotos/propiedad | Destacada | Analytics |
|---|---:|---:|---:|---:|:--:|:--:|
| `GRATIS` | 0 | 5 | 10 | 5 | ✗ | ✗ |
| `BASICO` | 15.000 | 15 | 20 | 10 | ✗ | ✓ |
| `PREMIUM` | 30.000 | 30 | 30 | 20 | ✓ | ✓ |

- Los límites viven **duplicados** en `Usuario` (`propiedadesLimite`, `chatIaLimite`) y en `PLANES`.
  Al aprobar un `Pago` se sincronizan desde `PLANES`. → ver §9 (riesgo).

### Puntaje (completitud)
- `calcularPuntaje()` suma reglas ponderadas (título, descripción, precio, ubicación, fotos, etc.) y
  **acota a 100**. Es una medida de **qué tan completa** es la publicación, NO de calidad del inmueble.
- Orden por defecto del catálogo: `puntaje DESC`.

### Propiedades destacadas
- Requieren plan `PREMIUM` vigente y estado `APROBADA`.
- **Máximo 3** destacadas activas por usuario (`LIMITE_DESTACADAS_PREMIUM`).
- La portada (`findDestacadas`) muestra destacadas y **rellena** con las de mayor `puntaje` si faltan.

### Estimaciones (`propiedades/calcular-probabilidad.ts`)
- `probabilidadVenta`: 40% puntaje + 60% competitividad de precio vs. similares (misma ciudad+tipo).
- `probabilidadOcupacional`: 20% puntaje + 60% precio + 20% características (área/habitaciones).
- `canonEsperado`: `precio × 0.6%` mensual. `rentabilidadAnual`: `(canon × 12) / precio`.
- Sin propiedades similares, la probabilidad cae al `puntaje` (o 50).

### Pagos
- El `monto` **debe coincidir** con `PLANES[plan].precio` (si no, error).
- Solo **un `Pago` `PENDIENTE`** por usuario a la vez.
- Aprobar un `Pago`: actualiza `plan` + `propiedadesLimite` + `chatIaLimite`, y **resetea** el uso diario de chat.
- Un `Pago` ya resuelto no puede volver a cambiar de estado.

### Verificación e identidad
- El celular se verifica por **OTP**: cooldown 60 s, expira 5 min, máx. 5 intentos, 6 dígitos,
  teléfono normalizado a `+57XXXXXXXXXX`. Un solo código activo por usuario (los anteriores se borran).
- Cambiar el celular **reinicia** `celularVerificado` a `false`.
- `documentoVerificado` es verificación **manual del admin** (KYC).

### Chat IA (Asesor)
- Cuota **diaria** por plan. El día se calcula en `APP_TIMEZONE` (por defecto `America/Bogota`).
- Solo responde sobre **propiedades `APROBADA`** del catálogo y no inventa inmuebles.
- Si la llamada a Gemini falla, **se devuelve el consumo** del chat.

### Reportes de fraude
- `motivo` obligatorio. Los gestiona el admin (`ABIERTO` → `RESUELTO`/`IGNORADO`).

---

## 6. Bounded contexts / módulos

| Contexto | Módulo NestJS | Responsabilidad |
|---|---|---|
| Identidad y acceso | `auth` | Registro, login, JWT, roles. |
| Usuarios | `usuarios` | Perfil, foto, documento de identidad, verificación, contraseña. |
| Verificación por SMS | `otp` | Emisión/validación de código OTP. |
| Catálogo | `propiedades` | CRUD, moderación, documentos, destacadas, puntaje y estimaciones. |
| Monetización | `pagos` | Planes, solicitudes de pago, aprobación y cambio de plan. |
| Asesor IA | `ia` | Chat con cuota diaria y estimación de propiedades. |
| Confianza | `reportes-fraude` | Reportes de fraude y métricas del panel admin. |
| Infraestructura | `prisma`, `storage`, `common` | Acceso a datos, Supabase Storage, tipos compartidos. |

---

## 7. Roles y capacidades

| Capacidad | Visitante | `USER` | `ADMIN` |
|---|:--:|:--:|:--:|
| Ver catálogo aprobado | ✓ | ✓ | ✓ |
| Ver contacto del publicador | ✗ | ✓ | ✓ |
| Publicar/editar/eliminar propiedades | ✗ | ✓ (propias) | ✓ |
| Destacar propiedades | ✗ | ✓ (PREMIUM) | ✓ |
| Solicitar pago / cambiar plan | ✗ | ✓ | ✓ |
| Ver contacto de propiedades | ✗ | ✓ | ✓ |
| Aprobar/rechazar propiedades | ✗ | ✗ | ✓ |
| Verificar documentos / teléfonos | ✗ | ✗ | ✓ |
| Gestionar pagos y reportes | ✗ | ✗ | ✓ |
| Panel de métricas | ✗ | ✗ | ✓ |

---

## 8. Flujos clave

1. **Alta de usuario:** registro → login (JWT) → registrar celular → solicitar OTP → verificar celular →
   subir documento de identidad → admin verifica.
2. **Publicación:** crear `Propiedad` (+ fotos) → `PENDIENTE` → admin revisa (puede pedir/verificar
   documentos) → `APROBADA` (visible) o `RECHAZADA` (con motivo).
3. **Monetización:** usuario solicita `Pago` con comprobante → admin aprueba → `Usuario.plan` y límites
   se actualizan.
4. **Descubrimiento:** búsqueda pública filtrada + chat Asesor IA + estimación de propiedad.
5. **Confianza:** usuario reporta una propiedad → admin gestiona el `ReporteFraude`.

---

## 9. Decisiones de arquitectura vigentes

- **Auth**: JWT propio (NestJS + `@nestjs/jwt` + bcrypt). **Decidido**: no se adopta Supabase Auth por
  ahora. Ver ADR (pendiente).
- **Acceso a datos**: Prisma directo a PostgreSQL (`DATABASE_URL`). Sin PostgREST.
- **Autorización**: en la aplicación (guards + verificación de propiedad del recurso). **Decidido**: no se
  usa RLS.
- **Storage**: Supabase Storage, `service_role` solo en el backend, documentos privados con **URLs firmadas**.

> Estas decisiones se documentaron alineando `README.md`, `AGENTS.md` y este `CONTEXT.md` con el código.
> Si alguna cambia, requiere un ADR en `docs/adr/`.

## 9.b Decisiones abiertas (pendientes de ADR)

Estas observaciones deben resolverse mediante ADRs en `docs/adr/` (aún no existen):

1. **Límites de plan duplicados** en `Usuario` y `PLANES`. Riesgo de desincronización; considerar una
   sola fuente de verdad (`Plan` como catálogo).
2. **`destacadaHasta`** siempre se escribe como `null`; no hay lógica de vencimiento. ¿Se planeó expiración?
3. **`tipo` de propiedad** es `String` libre (no enum) y **no existe campo de operación** (venta/arriendo).
   El `precio` se usa tanto para venta como para canon. Definir modelo de operación.
4. **Moneda:** se asume COP en todo el sistema; no hay soporte multi-moneda.
5. **Cobertura de tests:** backend tiene specs; el frontend no tiene tests configurados.

---

## 10. Preguntas abiertas (a resolver por grilling)

1. ¿Un mismo `Usuario` puede actuar como propietario y como interesado sin distinción? (hoy sí, no hay
   perfil de arrendatario/comprador).
2. ¿El catálogo es nacional o por ciudades específicas? ¿Hay ciudades objetivo prioritarias?
3. ¿El `precio` representa venta, arriendo o ambos? Si ambos, ¿cómo se modela?
4. ¿Las estimaciones (canon, rentabilidad) deben basarse solo en propiedades de la misma ciudad/tipo?
   (hoy es la regla implícita).
5. ¿"Terrenos" (mencionados en el README) tienen campos distintos a vivienda?
6. ¿Verificación de documento es requisito para publicar o solo para generar confianza?

---

## 11. Cómo mantener este documento

- Actualizar **de inmediato** cuando cambie: enums de estado, límites de plan, reglas de puntaje/estimación,
  o roles.
- Decisiones de arquitectura → **ADR** en `docs/adr/`, y enlazar desde aquí.
- Mantener el glosario como **único** origen de nombres de dominio; si aparece un sinónimo, se corrige el
  código o se actualiza el glosario con justificación.
