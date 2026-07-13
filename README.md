# SAS Talento & Desarrollo

Plataforma de RRHH de SAS Consultora. Conecta PYMEs con profesionales: publicación y
postulación a vacantes (con CV y referencias laborales), capacitaciones, mentorías y
un panel de administración interno. Backend real en Supabase (Postgres + Auth + Storage).

**Sitio en vivo:** https://sasconsultora24-rgb.github.io/talento-desarrollo/
**Repositorio:** https://github.com/sasconsultora24-rgb/talento-desarrollo

## Stack

- React + Vite, `HashRouter` (necesario para que el routing funcione en GitHub Pages sin configuración de servidor)
- React Router (rutas por rol: candidato / empresa / admin)
- Tailwind CSS
- Supabase: Postgres (datos), Auth (email + contraseña, con confirmación por email), Storage (CVs de candidatos)
- Hosting: GitHub Pages, rama `gh-pages` con el build estático

## Cómo correrlo localmente

```bash
npm install
cp .env.example .env   # completar con tu URL y anon key de Supabase
npm run dev             # http://localhost:5173
npm run build            # genera dist/ para producción
```

Variables de entorno necesarias en `.env`:

```
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key-publica>
```

## Ingresar a la app

El login es real, con Supabase Auth (email + contraseña):

- **Registrarse** (`/registro`): profesionales o PYMEs crean su cuenta con email y contraseña.
  Supabase envía un email de confirmación; hasta que no se confirma, no se puede ingresar.
- **Ingresar** (`/ingresar`): con el email y contraseña ya confirmados, redirige automáticamente
  al panel según el rol (candidato, empresa o admin).
- **Admin**: cuenta interna de SAS Consultora, creada directamente en la base (no hay
  autoregistro de admins).

## Estructura

```
src/
  data/             # supabaseClient.js (cliente) y store.jsx (contexto, sesión y acciones)
  components/       # Navbar, Footer, Layout, RequireRole, componentes de UI reutilizables
  pages/            # Landing, Vacantes, Capacitaciones, Mentorías, Para PYMEs, Registro, Ingresar
  pages/candidato/  # Panel del profesional
  pages/empresa/    # Panel de la PYME
  pages/admin/      # Panel interno de SAS Consultora
```

## Base de datos

El esquema, las políticas de Row Level Security y los datos de ejemplo viven en el
proyecto de Supabase (migraciones aplicadas vía MCP, no versionadas como archivos SQL
en este repo todavía). Tablas principales: `empresas`, `candidatos`, `admins`, `vacantes`,
`postulaciones`, `capacitaciones`, `capacitacion_inscriptos`, `mentorias`, `mentoria_reservas`.

## Redesplegar a GitHub Pages

```bash
npm run build --outDir build_deploy --emptyOutDir
# copiar el contenido de build_deploy/ a la raíz de la rama gh-pages
# (incluir un archivo .nojekyll vacío)
# commitear y pushear la rama gh-pages
```

## Portabilidad a otro hosting

La app no tiene dependencias específicas de GitHub Pages: usa `HashRouter` (sin necesidad
de reglas de rewrite en el servidor) y todos los assets son relativos al `base` configurado
en `vite.config.js`. Se puede desplegar el contenido de `dist/` en cualquier hosting estático
(Netlify, Cloudflare Pages, un servidor propio en DonWeb, etc.) sin tocar el código de la app.

## Checklist hacia la versión definitiva

Ver `CHECKLIST-VERSION-DEFINITIVA.md` para el detalle de lo que falta antes de considerar
esto un producto terminado (diseño/marca, responsive, buscador de candidatos, motor de pago,
notificaciones por email, políticas de privacidad, etc.).
