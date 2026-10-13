# ADR 0001 — Modelo de sesión y endurecimiento de la autenticación

- Estado: Aceptado
- Fecha: 2026-10-09
- Contexto: CONTEXT.md §3 y §9; riesgos R2, R3, R6

## Contexto

El backend emite JWT propio (NestJS + bcrypt). Antes, el token vivía 24 h, se guardaba en
`localStorage` y viajaba como `Authorization: Bearer`. Sin refresh ni revocación: cerrar sesión
solo borraba el `localStorage` y el token seguía válido hasta expirar. Un XSS podía robar la
sesión (R2); cambiar contraseña o expulsar a un usuario no surtía efecto (R3); el `JWT_SECRET`
no tenía procedimiento de rotación (R6).

## Decisión

1. **Access token**: JWT de vida corta (**15 min**) con claim `tokenVersion`.
2. **Refresh token**: valor opaco (32 bytes), almacenado **hasheado (SHA-256)** en `RefreshToken`,
   vida **30 días**.
3. Transporte: cookies **`httpOnly`**, `SameSite=Lax`, `Secure` en producción.
   `refresh_token` con `path=/auth`; `access_token` con `path=/`.
4. Refresh **rotativo**: cada `/auth/refresh` invalida el token usado. Reusar uno ya rotado
   **revoca todas** las sesiones del usuario (detección de reuso).
5. **Revocación global**: `Usuario.tokenVersion`. Al incrementarlo, los access emitidos antes
   quedan inválidos; `JwtStrategy` compara el claim contra el valor vigente.
6. **CSRF**: `SameSite=Lax` + verificación de `Origin` en métodos mutadores.
7. El frontend no toca `localStorage` para la sesión; usa `GET /auth/me`.

## Consecuencias

- Se elimina el token del `localStorage` (cierra R2).
- Revocación inmediata del refresh; el access caduca en ≤15 min (cierra R3).
- Cada request autenticado hace una lectura extra de `Usuario` para validar `tokenVersion`.
- La API exige CORS con `credentials: true`; en producción front y API deben compartir dominio
  registrable para que `SameSite=Lax` deje pasar las cookies.

## Alternativas descartadas

- Supabase Auth (Opciones C/B del análisis): fuera de alcance por ahora (CONTEXT.md §9.b).

## Rotación de `JWT_SECRET` (R6)

Cambiar el secreto invalida todas las sesiones al instante (fuerza re-login). Runbook: generar
secreto nuevo → desplegar → los tokens viejos reciben 401 y el interceptor usa `/auth/refresh`
(si el refresh sigue vivo) o el usuario vuelve a `/login`.
