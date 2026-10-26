/**
 * Sanitiza y valida la URL de redirección post-login para prevenir Open Redirects (CWE-601).
 * Únicamente permite rutas internas relativas que inicien con '/' seguro.
 */
export function sanitizeRedirectUrl(url?: string | null): string {
  if (!url || typeof url !== "string") {
    return "/dashboard";
  }

  const trimmed = url.trim();

  // 1. Debe iniciar estrictamente con '/'
  if (!trimmed.startsWith("/")) {
    return "/dashboard";
  }

  // 2. Prohibir '//' y '/\' (ataques protocol-relative o UNC paths hacia dominios externos)
  if (trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.startsWith("/%2f") || trimmed.startsWith("/%5c")) {
    return "/dashboard";
  }

  // 3. Prohibir esquemas explícitos (http:, https:, javascript:, data:, etc.)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return "/dashboard";
  }

  // 4. Prohibir caracteres de control (CR, LF, Tab, etc.)
  if (/[\r\n\t]/.test(trimmed)) {
    return "/dashboard";
  }

  // 5. Prohibir bucles recursivos hacia /login
  if (trimmed === "/login" || trimmed.startsWith("/login?") || trimmed.startsWith("/login/")) {
    return "/dashboard";
  }

  return trimmed;
}
