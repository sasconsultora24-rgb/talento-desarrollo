# SAS Talento & Desarrollo

Plataforma de RRHH de SAS Consultora. Conecta PYMEs con profesionales: publicación y
postulación a vacantes (con CV y referencias), capacitaciones, mentorías y un panel
de administración interno.

**Sitio en vivo:** https://sasconsultora24-rgb.github.io/talento-desarrollo/
**Repositorio:** https://github.com/sasconsultora24-rgb/talento-desarrollo

## Stack

- React + Vite, con `HashRouter` (rutas tipo `/#/vacantes`) para que el sitio funcione
  en cualquier hosting estático sin configuración especial de rutas.
- Tailwind CSS (identidad visual propia: navy + teal + amber).
- **Supabase**: base de datos Postgres real (candidatos, empresas, vacantes,
  postulaciones, capacitaciones, mentorías) + Storage para los CV adjuntos.
- Hosting: **GitHub Pages**, sirviendo el build estático desde la rama `gh-pages`.

## Cómo correrlo localmente

```bash
npm install
cp .env.example .env   # completar con las credenciales de Supabase (ver abajo)
npm run dev             # http://localhost:5173
npm run build            # genera dist/ para producción
```

Variables de entorno necesarias en `.env` (no se commitean):

```
VITE_SUPABASE_URL=https://valncabvniutalzhovuc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

## Ingresar a la app

En `/#/ingresar` se simula el ingreso como:
- **Profesional**: elegís uno de los perfiles de ejemplo.
- **PYME**: elegís una de las empresas de ejemplo.
- **Admin (equipo SAS)**: acceso interno para moderar vacantes, cargar capacitaciones y ver métricas.

Todavía no hay autenticación real (contraseñas): los datos ya están en una base real
(Supabase), pero cualquiera con el link técnico podría leer/escribir. Antes de cargar
datos de personas reales conviene sumar login real (email + contraseña) con Supabase Auth.

## Estructura

```
src/
  data/         # store.jsx (contexto + acciones sobre Supabase), supabaseClient.js, seed.js (planes estáticos)
  components/   # Navbar, Footer, Layout, componentes de UI reutilizables
  pages/        # Landing, Vacantes, Capacitaciones, Mentorías, Para PYMEs, Registro, Ingresar
  pages/candidato/  # Panel del profesional
  pages/empresa/    # Panel de la PYME
  pages/admin/      # Panel interno de SAS Consultora
```

## Cómo volver a publicar cambios (GitHub Pages)

```bash
npm run build
npx gh-pages -d dist   # o: copiar dist/ a una rama gh-pages y pushearla
```

(La primera vez se hizo manualmente creando la rama `gh-pages` con el contenido de
`dist/` y pusheándola; para las próximas actualizaciones alcanza con reconstruir y
volver a pushear esa rama.)

## Portabilidad a otro hosting

El sitio es 100% estático (sin funciones de servidor, sin nada específico de GitHub
Pages). Se puede mover a cualquier hosting que sirva archivos — incluido un hosting
tradicional tipo cPanel/FTP (ej. DonWeb) — corriendo `npm run build` y subiendo el
contenido de `dist/`. Gracias al `HashRouter`, no hace falta configurar redirecciones
especiales para que las rutas internas funcionen.

La base de datos (Supabase) es independiente del hosting del sitio y no cambia aunque
se mude el frontend.

## Próximos pasos sugeridos

- Autenticación real (Supabase Auth) para candidatos, empresas y admin.
- Automatizar el deploy a GitHub Pages con GitHub Actions en cada push a `main`.
- Sumar cobros para los planes de empresas y candidatos.
