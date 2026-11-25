// Convierte un valor en texto seguro para insertarlo dentro de un template HTML.
// Evita que comillas o etiquetas escritas por el usuario rompan el HTML (XSS).
export function escapeHtml(valor) {
  return String(valor ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
