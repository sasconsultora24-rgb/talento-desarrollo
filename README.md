# SAS Talento & Desarrollo

Prototipo funcional de la plataforma de RRHH de SAS Consultora. Conecta PYMEs con
profesionales: publicación y postulación a vacantes, capacitaciones, mentorías y un
panel de administración interno.

**Demo en vivo:** https://sas-talento-desarrollo.netlify.app

## Stack

- React + Vite
- React Router (rutas por rol: candidato / empresa / admin)
- Tailwind CSS (identidad visual propia: navy + teal + amber)
- Datos simulados en `localStorage` (sin backend todavía) — ver `src/data/`

## Cómo correrlo localmente

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # genera dist/ para producción
```

## Ingresar al prototipo

En `/ingresar` podés simular el ingreso como:
- **Profesional**: elegís uno de los perfiles de ejemplo.
- **PYME**: elegís una de las empresas de ejemplo.
- **Admin (equipo SAS)**: acceso interno para moderar vacantes, cargar capacitaciones y ver métricas.

No hay contraseñas: es un prototipo para validar diseño y flujos antes de construir el backend real.

## Estructura

```
src/
  data/         # store.jsx (contexto + acciones) y seed.js (datos de ejemplo)
  components/   # Navbar, Footer, Layout, componentes de UI reutilizables
  pages/        # Landing, Vacantes, Capacitaciones, Mentorías, Para PYMEs, Registro, Ingresar
  pages/candidato/  # Panel del profesional
  pages/empresa/    # Panel de la PYME
  pages/admin/      # Panel interno de SAS Consultora
```

## Subir a GitHub

El proyecto ya tiene un repositorio git local inicializado con el primer commit.
Para subirlo:

```bash
git remote add origin <URL_DE_TU_REPO_EN_GITHUB>
git branch -M main
git push -u origin main
```

## Próximos pasos sugeridos

- Reemplazar `localStorage` por un backend real (autenticación, base de datos).
- Conectar el repositorio de GitHub a Netlify para que cada push despliegue automáticamente.
- Sumar pagos para los planes de empresas y candidatos.
