# Jema Inmobiliaria

Plataforma diseñada para crear, consultar y mostrar terrenos, vivienda, entre otros, todo integrado con IA.

## Stack

- **Frontend**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind 4
- **Backend**: NestJS 11 + TypeScript (API REST en el puerto 3001)
- **Base de datos**: PostgreSQL (gestionado en Supabase) accedido con **Prisma ORM**
- **Autenticación**: JWT propio (NestJS + `@nestjs/jwt` + bcrypt) — **no** Supabase Auth
- **Storage**: Supabase Storage (solo archivos; el `service_role` vive únicamente en el backend)
- **IA**: Google Gemini (chat y estimaciones)
- **Deploy**: Vercel (frontend)
- **Monorepo**: pnpm workspaces (`apps/frontend`, `apps/backend`)

## Arquitectura de autenticación y acceso a datos

- El backend NestJS es la **única puerta** a los datos.
- La sesión es un **JWT** firmado por el backend; el frontend lo envía como `Authorization: Bearer`.
- **No se usa RLS**: la autorización se resuelve en la aplicación (guards + verificación de propiedad del recurso).
- Supabase se usa **solo como Storage**, no como proveedor de identidad ni vía PostgREST.
