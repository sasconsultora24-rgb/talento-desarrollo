import { useEffect } from "react";

// Hace scroll suave hasta el elemento con id === valor de ?ver=... en la URL.
// El contenido de estas páginas llega async desde Supabase, así que el
// elemento objetivo puede no existir todavía en el primer render — por eso
// reintenta por un par de segundos en vez de buscarlo una sola vez al montar.
export function useScrollToAnchor(searchParams, paramName = "ver") {
  useEffect(() => {
    const id = searchParams.get(paramName);
    if (!id) return;
    let intentos = 0;
    const intervalo = setInterval(() => {
      const el = document.getElementById(id);
      intentos += 1;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        clearInterval(intervalo);
      } else if (intentos > 30) {
        clearInterval(intervalo); // ~3s, desistimos si el id no existe
      }
    }, 100);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get(paramName)]);
}
