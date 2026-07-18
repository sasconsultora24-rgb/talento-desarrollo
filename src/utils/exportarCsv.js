// Exportación simple a CSV (se abre directo en Excel/Google Sheets) sin
// depender de ninguna librería extra — evita sumar peso al bundle solo para
// esto. `columnas` es un array de { titulo, valor(fila) } y `filas` los
// datos ya mapeados a objetos "de la app" (camelCase).
function escaparCsv(valor) {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  if (/[",\n]/.test(texto)) {
    return `"${texto.replace(/"/g, '""')}"`;
  }
  return texto;
}

export function descargarCSV(nombreArchivo, columnas, filas) {
  const encabezado = columnas.map((c) => escaparCsv(c.titulo)).join(",");
  const cuerpo = filas.map((fila) => columnas.map((c) => escaparCsv(c.valor(fila))).join(",")).join("\n");
  // BOM al principio para que Excel detecte UTF-8 y no rompa acentos/ñ.
  const csv = "﻿" + encabezado + "\n" + cuerpo;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
