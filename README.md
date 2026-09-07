# Sistema de Registro Multi-Rol (Alumno · Instructor · Externo · Expositor)

Aplicación web de registro y acreditación construida con **Next.js 16 (App Router) + TypeScript + Tailwind CSS + Supabase**. Cada tipo de participante completa un formulario adaptado a su rol, con validaciones en el cliente, en el servidor y en la base de datos (defensa en profundidad).

---

## Índice

1. [Stack y decisiones de arquitectura](#1-stack-y-decisiones-de-arquitectura)
2. [Requisitos](#2-requisitos)
3. [Instalación](#3-instalación)
4. [Crear el proyecto en Supabase](#4-crear-el-proyecto-en-supabase)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Ejecutar las migraciones SQL](#6-ejecutar-las-migraciones-sql)
7. [Configurar Supabase Auth](#7-configurar-supabase-auth)
8. [Ejecución en local](#8-ejecución-en-local)
9. [Pruebas automatizadas](#9-pruebas-automatizadas)
10. [Build de producción](#10-build-de-producción)
11. [Despliegue](#11-despliegue)
12. [Estructura del proyecto](#12-estructura-del-proyecto)
13. [Modelo de datos y seguridad](#13-modelo-de-datos-y-seguridad)
14. [Creación controlada de administradores](#14-creación-controlada-de-administradores)
15. [Solución de errores comunes](#15-solución-de-errores-comunes)
16. [Roadmap / cómo extender el proyecto](#16-roadmap--cómo-extender-el-proyecto)

---

## 1. Stack y decisiones de arquitectura

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Server Components + Server Actions reducen JS en el cliente y permiten validar en servidor sin escribir una API aparte. |
| Lenguaje | **TypeScript estricto** | `strict: true` + `noUncheckedIndexedAccess`, sin `any` salvo casos justificados. |
| Estilos | **Tailwind CSS** | Diseño consistente, sin CSS muerto, mobile-first. |
| Base de datos / Auth | **Supabase (PostgreSQL + Supabase Auth)** | Row Level Security real a nivel de base de datos, no solo en la app. |
| Validación | **Zod** | Un único esquema reutilizado en formularios, Server Actions y (documentado) constraints SQL equivalentes. |
| Pruebas | **Vitest** | Pruebas unitarias rápidas para validaciones y utilidades críticas. |

**Decisiones clave documentadas** (ver también los comentarios en `supabase/migrations/0001_init_schema.sql`):

- **Una tabla `profiles` + una tabla por rol** (`alumno_profiles`, `instructor_profiles`, `externo_profiles`, `expositor_profiles`) en vez de una tabla gigante con columnas opcionales. Permite agregar un rol nuevo sin tocar las tablas existentes.
- **UUID como identificador interno** (igual a `auth.users.id`) y un **código corto público autogenerado en servidor** (`EX-XXXXXX` / `XP-XXXXXX`) para Externos y Expositores, que no tienen número de control institucional. El código nunca lo genera ni lo envía el cliente.
- **"Otra institución" es un campo condicional** reforzado en 3 capas: se oculta/muestra en el formulario (React), se valida con Zod (`superRefine`), y se valida con un `CHECK CONSTRAINT` en PostgreSQL como última línea de defensa.
- **RLS con "denegar por defecto"**: cada tabla tiene RLS habilitado y políticas explícitas. Un usuario solo puede leer/escribir su propia fila de rol; `profiles` no admite INSERT directo desde el cliente; un usuario no puede insertar en la tabla de un rol distinto al suyo; nadie puede autoasignarse `admin` ni cambiar su propio `role`.
- **`server-only`** en el cliente admin de Supabase: si alguien importa por error la `service_role key` desde un Client Component, el build falla en vez de filtrar la clave al navegador.

> **Aviso de actualización de versión (documentado, no oculto):** el proyecto usa Next.js **16**, publicado después del corte de conocimiento del asistente que lo generó. Durante la verificación (`npm audit`, `npm run build`) se detectaron y corrigieron en consecuencia dos cambios de breaking changes de Next 15→16: (1) `cookies()` de `next/headers` ahora es asíncrono, y (2) el archivo `middleware.ts` se renombró a la convención `proxy.ts` (exportando una función `proxy`). Ambos ya están aplicados en este repositorio y el build queda verificado sin errores ni warnings.

---

## 2. Requisitos

- **Node.js 20 o superior** (recomendado 20 LTS o 22).
- **npm** (el proyecto se probó con npm; puedes usar pnpm/yarn si lo prefieres, pero tendrás que regenerar el lockfile).
- Una cuenta gratuita en [supabase.com](https://supabase.com).
- (Opcional) [Supabase CLI](https://supabase.com/docs/guides/cli) si prefieres ejecutar las migraciones desde tu máquina en vez de pegarlas en el Dashboard.

---

## 3. Instalación

```bash
# 1. Descomprime proyecto-web.zip y entra a la carpeta
cd proyecto-web

# 2. Instala las dependencias
npm install
```

---

## 4. Crear el proyecto en Supabase

1. Entra a [https://supabase.com/dashboard](https://supabase.com/dashboard) e inicia sesión (o crea una cuenta).
2. Haz clic en **New Project**.
3. Elige una organización, un nombre para el proyecto, una contraseña de base de datos (guárdala, la necesitarás para el CLI si lo usas) y una región cercana a tus usuarios.
4. Espera 1-2 minutos a que Supabase aprovisione el proyecto.

---

## 5. Variables de entorno

1. Copia el archivo de ejemplo:

   ```bash
   cp .env.example .env.local
   ```

2. En el Dashboard de Supabase, ve a **Project Settings → API** y copia:

   | Variable en `.env.local` | Dónde encontrarla en Supabase |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "Project API keys" → `anon` `public` |
   | `SUPABASE_SERVICE_ROLE_KEY` (opcional) | "Project API keys" → `service_role` — **nunca la subas a git ni la uses en el cliente** |

3. Deja `NEXT_PUBLIC_SITE_URL=http://localhost:3000` para desarrollo local. En producción, cámbiala por tu dominio real (se usa en metadata SEO y en los enlaces de los correos de confirmación/recuperación de contraseña).

`.env.local` ya está en `.gitignore`: nunca se sube al repositorio.

---

## 6. Ejecutar las migraciones SQL

Las migraciones están en `supabase/migrations/`, en orden:

- `0001_init_schema.sql` — extensiones, enums, tablas, triggers, generador de código corto.
- `0002_rls_policies.sql` — Row Level Security (denegar por defecto) y funciones de apoyo.
- `0003_views.sql` — vista de solo lectura `people_directory`.

### Opción A — Panel de Supabase (más simple)

1. Ve a **SQL Editor** en el Dashboard de tu proyecto.
2. Abre `supabase/migrations/0001_init_schema.sql`, copia todo el contenido, pégalo en un query nuevo y haz clic en **Run**.
3. Repite con `0002_rls_policies.sql` y luego con `0003_views.sql`, **en ese orden**.

### Opción B — Supabase CLI

```bash
npm install -g supabase   # si no lo tienes instalado
supabase login
supabase link --project-ref TU_PROJECT_REF   # lo ves en la URL del dashboard
supabase db push
```

`supabase/seed.sql` no inserta datos de negocio a propósito (ver comentario dentro del archivo): el flujo de prueba real es registrar usuarios desde la propia app.

---

## 7. Configurar Supabase Auth

1. En el Dashboard, ve a **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` en desarrollo (cámbialo a tu dominio en producción).
   - **Redirect URLs**: agrega `http://localhost:3000/auth/callback` (y la versión de producción, ej. `https://tu-dominio.com/auth/callback`).
2. En **Authentication → Providers → Email**, decide si quieres exigir confirmación de correo (recomendado en producción). El flujo de la app soporta ambos casos:
   - **Con confirmación de correo**: tras registrarse, el usuario ve la pantalla "Revisa tu correo"; al confirmar, regresa a `/auth/callback` y completa los datos de su rol en `/onboarding`.
   - **Sin confirmación de correo** (útil en desarrollo): el usuario queda con sesión activa inmediatamente y completa su perfil de rol en el mismo flujo de registro.
3. No se requiere ninguna configuración adicional de proveedores OAuth para que la app funcione (el sistema usa email + contraseña).

---

## 8. Ejecución en local

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Flujo recomendado para probar todo:

1. Ve a **Crear cuenta**, elige un rol (Alumno / Instructor / Externo / Expositor) y completa el formulario. Prueba seleccionar "Otra institución" para ver el campo condicional.
2. Si configuraste confirmación de correo, revisa tu bandeja (o los logs de Supabase Auth en el Dashboard → **Authentication → Users** para confirmar manualmente en desarrollo) y sigue el enlace.
3. Inicia sesión y revisa el **Dashboard**: verás tus datos y, si eres Externo o Expositor, tu código de acreditación autogenerado.
4. Ve a **Mi perfil** para editar tus datos.
5. Prueba **¿Olvidaste tu contraseña?** para el flujo de recuperación.

---

## 9. Pruebas automatizadas

```bash
npm test
```

Cubre lo más crítico de validar sin necesidad de una base de datos real:

- Reglas de contraseña, login y reset de contraseña (`tests/auth.test.ts`).
- Las 4 variantes de registro por rol, incluida la regla condicional de "Otra institución" y "Otro grado académico" (`tests/registration.test.ts`).
- Que los errores técnicos de Postgres nunca se filtran al usuario final (`tests/errors.test.ts`).

---

## 10. Build de producción

```bash
npm run typecheck   # TypeScript estricto, sin errores
npm run lint        # ESLint, sin errores ni warnings
npm run build        # build de producción con Turbopack
npm start             # sirve el build de producción en :3000
```

El build fue verificado localmente sin errores ni warnings, generando 15 rutas (estáticas y dinámicas) y el proxy de sesión.

---

## 11. Despliegue

El proyecto no depende de ninguna característica específica de un proveedor; funciona en cualquier plataforma compatible con Next.js 16 (Vercel, Netlify, contenedores propios, etc.). Pasos generales:

1. Sube el repositorio a GitHub/GitLab (recuerda que `.env.local` no se sube, está en `.gitignore`).
2. En tu plataforma de hosting, configura las mismas variables de entorno de `.env.example` (con los valores reales de producción).
3. Actualiza `NEXT_PUBLIC_SITE_URL` al dominio final, y agrégalo también en **Authentication → URL Configuration** de Supabase (Site URL + Redirect URLs con `/auth/callback`).
4. Ejecuta el build (`npm run build`) — la mayoría de plataformas lo hacen automáticamente.

---

## 12. Estructura del proyecto

```
proyecto-web/
├─ src/
│  ├─ app/                     # Rutas (App Router)
│  │  ├─ auth/                 # login, register, forgot/reset password, callback
│  │  ├─ dashboard/            # área privada (layout protegido + perfil)
│  │  ├─ onboarding/           # completar datos de rol tras confirmar correo
│  │  ├─ page.tsx              # landing pública (SEO)
│  │  ├─ robots.ts / sitemap.ts
│  │  └─ error.tsx / not-found.tsx / loading.tsx
│  ├─ components/
│  │  ├─ ui/                   # Button, Input, Select, Card, Alert, Badge…
│  │  ├─ forms/                # formularios por rol (registro, onboarding, edición)
│  │  ├─ layout/                # navbar/footer públicos, shell del dashboard
│  │  └─ auth/                  # layout compartido de páginas de auth
│  ├─ lib/                      # supabase (client/server/admin), env, errors, utils
│  ├─ services/                 # lógica de negocio server-only (registro, perfil)
│  ├─ types/                    # tipos de la base de datos (Database)
│  ├─ validations/               # esquemas Zod (común, auth, registro, perfil)
│  └─ proxy.ts                   # antes "middleware": sesión + rutas protegidas
├─ supabase/
│  ├─ migrations/                # SQL versionado (esquema, RLS, vistas)
│  └─ seed.sql
├─ tests/                        # pruebas Vitest
├─ .env.example
└─ README.md
```

---

## 13. Modelo de datos y seguridad

- **`profiles`**: datos comunes (`id` = `auth.users.id`, `role`, `full_name`, `phone`, `onboarding_completed`). Se crea exclusivamente vía trigger `on_auth_user_created` al registrarse. El trigger aplica una allowlist estricta (`alumno`, `instructor`, `externo`, `expositor`), por lo que `admin` nunca puede solicitarse desde `signUp()`.
- **`alumno_profiles` / `instructor_profiles` / `externo_profiles` / `expositor_profiles`**: un registro por usuario, con `profile_id` como FK y PK a la vez (relación 1:1).
- **`people_directory`**: vista de solo lectura que unifica los 4 roles para futuros reportes/paneles administrativos, respetando RLS (`security_invoker`).
- **RLS activo en las 5 tablas**: cada política exige `profile_id = auth.uid()` (o `is_admin()`). Insertar en la tabla de rol equivocado, crear manualmente un `profiles`, autoasignarse `admin` o cambiar el propio `role` está bloqueado a nivel de base de datos, no solo escondido en la interfaz.
- **Onboarding atómico**: al insertar la fila específica de rol, un trigger de PostgreSQL marca `onboarding_completed = true` dentro de la misma transacción. No quedan registros a medias si falla el alta de rol.
- **Nunca se exponen errores crudos de Postgres**: todo pasa por `src/lib/errors.ts`, que traduce códigos (`23505`, `23514`, etc.) a mensajes en español comprensibles.

---

## 14. Creación controlada de administradores

El rol `admin` **no se puede solicitar desde el formulario ni desde `supabase.auth.signUp()`**. Esto es intencional para impedir escalamiento de privilegios.

Para promover una cuenta existente a administrador, hazlo únicamente desde un canal privilegiado (por ejemplo, el SQL Editor del proyecto Supabase operado por un administrador del sistema):

```sql
update public.profiles
set role = 'admin'
where id = '<UUID_DEL_USUARIO>';
```

Antes de ejecutar el `UPDATE`, verifica el UUID directamente en **Authentication → Users**. No expongas una ruta pública que acepte un UUID y cambie roles. Si en el futuro agregas gestión de administradores desde la aplicación, esa acción debe ejecutarse exclusivamente en servidor con autorización reforzada y auditoría.

---

## 15. Solución de errores comunes

**"Configuración incompleta: revisa tu archivo .env.local..."**
Falta `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`. Revisa el paso 5.

**El registro funciona pero el dashboard me manda a `/onboarding` en un loop**
Verifica que las migraciones `0001` y `0002` se ejecutaron completas (en especial el trigger `on_auth_user_created` y las políticas de `insert` de la tabla de tu rol). Revisa en el Dashboard → **Table Editor** que tu fila exista en `profiles` y en la tabla de tu rol.

**"Ese registro ya existe" al registrarme**
El número de control (Alumno/Instructor) o el correo ya están en uso — es la validación `UNIQUE` de la base de datos funcionando correctamente.

**No me llega el correo de confirmación**
En desarrollo, ve a **Authentication → Users** en el Dashboard de Supabase y confirma el usuario manualmente, o desactiva temporalmente "Confirm email" en **Authentication → Providers → Email** para agilizar pruebas locales.

**Error de `npm install` por versiones**
Asegúrate de usar Node 20+. Si cambiaste versiones de paquetes manualmente, corre `rm -rf node_modules package-lock.json && npm install` para una instalación limpia.

---

## 16. Roadmap / cómo extender el proyecto

La arquitectura fue pensada para crecer sin reescribirse:

- **Nuevo rol** → agrega un enum nuevo a `user_role`, una tabla `nuevo_rol_profiles` con su propio `CHECK` condicional si aplica, sus políticas RLS (copia el patrón de las existentes) y un caso más en los `switch` de `registration.service.ts` / `profile.service.ts` / los formularios.
- **Códigos QR / acreditación física**: el `public_code` de Externos/Expositores ya es un identificador único listo para codificar en un QR.
- **Panel administrativo**: la vista `people_directory` y la función `is_admin()` ya existen; solo falta una ruta `/admin` protegida por rol.
- **Notificaciones, exportación de datos, reportes**: pueden construirse como Route Handlers o Server Actions adicionales que consulten `people_directory`, sin tocar el esquema existente.
