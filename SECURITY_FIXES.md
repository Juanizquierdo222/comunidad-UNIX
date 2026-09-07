# Correcciones de seguridad aplicadas

Este paquete incorpora ajustes adicionales sobre la entrega original:

1. **El registro público ya no puede crear administradores.**
   `handle_new_user()` usa una allowlist estricta de roles públicos:
   `alumno`, `instructor`, `externo`, `expositor`. Cualquier otro valor
   (incluido `admin`) se degrada de forma segura a `alumno`.

2. **Se eliminó el INSERT directo sobre `profiles`.**
   La tabla `profiles` se crea exclusivamente mediante el trigger de
   `auth.users`; el cliente autenticado no tiene una policy para fabricar
   perfiles manualmente.

3. **Onboarding atómico.**
   Un trigger `AFTER INSERT` de cada tabla específica de rol marca
   `profiles.onboarding_completed = true` dentro de la misma transacción
   PostgreSQL. Se eliminó la segunda operación separada desde TypeScript.

4. **Protección del estado de onboarding.**
   Un usuario no puede marcar directamente `onboarding_completed` desde
   el cliente. Solo puede hacerlo el flujo legítimo que inserta su fila
   específica de rol.

5. **`created_at` queda inmutable en `profiles`.**
   Los UPDATE conservan el valor original.

6. **Creación de administradores documentada.**
   El README explica cómo promover de forma controlada una cuenta existente
   desde un canal privilegiado de Supabase, nunca desde el registro público.

7. **Prueba adicional.**
   Se agregó una prueba de Vitest que verifica que el schema de registro
   rechaza `role: "admin"`.

## Verificación local

El código fue revisado estáticamente tras las modificaciones. En este entorno
no fue posible completar `npm ci` por timeout de transporte, así que los comandos
`npm run typecheck`, `npm run lint`, `npm test` y `npm run build` deben ejecutarse
una vez en tu equipo después de `npm ci`.
