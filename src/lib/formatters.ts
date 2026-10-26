/**
 * Utilidades de formato para la interfaz de Mishutec
 */

/**
 * Formatea un valor numérico como moneda en Soles Peruanos (PEN).
 * Ejemplo: 1250.5 -> S/. 1,250.50
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount ?? 0;
  if (isNaN(num)) return "S/. 0.00";

  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formatea un número estándar con separadores de miles.
 */
export function formatNumber(value: number | string | null | undefined): string {
  const num = typeof value === "string" ? parseFloat(value) : value ?? 0;
  if (isNaN(num)) return "0";

  return new Intl.NumberFormat("es-PE").format(num);
}

/**
 * Formatea una fecha ISO o cadena YYYY-MM-DD a formato legible en español.
 * Ejemplo: '2026-09-01' -> '01 sept 2026'
 */
export function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-";
  
  // Normalizar strings tipo '2026-09-01' para evitar desfase de zona horaria
  let date: Date;
  if (typeof dateString === "string" && dateString.includes("T")) {
    date = new Date(dateString);
  } else if (typeof dateString === "string") {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    } else {
      date = new Date(dateString);
    }
  } else {
    date = dateString;
  }

  if (isNaN(date.getTime())) return String(dateString);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Formato de fecha corta DD/MM/YYYY
 */
export function formatShortDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return "-";
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(date.getTime())) return String(dateString);

  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

/**
 * Enmascara un DNI peruano para protección de datos personales (Ley 29733).
 * Ejemplo: '72145890' -> '72****90'
 */
export function maskDni(dni: string | null | undefined): string {
  if (!dni) return "****";
  const str = dni.trim();
  if (str.length < 4) return "****";
  return `${str.slice(0, 2)}****${str.slice(-2)}`;
}

/**
 * Enmascara un número de teléfono para protección de datos personales (Ley 29733).
 * Ejemplo: '987654321' -> '987***321'
 */
export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const str = phone.trim();
  if (!str) return null;
  if (str.length <= 4) return "****";
  if (str.length >= 7) {
    return `${str.slice(0, 3)}***${str.slice(-3)}`;
  }
  return `${str.slice(0, 2)}***${str.slice(-2)}`;
}

/**
 * Enmascara un correo electrónico para protección de datos personales (Ley 29733).
 * Ejemplo: 'ana.torres@gmail.com' -> 'a***@gmail.com'
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return "****@****.***";
  const str = email.trim();
  if (!str.includes("@")) return "****@****.***";

  const parts = str.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return "****@****.***";

  const user = parts[0];
  const domain = parts[1];

  if (user.length <= 1) return `*@${domain}`;
  return `${user[0]}***@${domain}`;
}

/**
 * Enmascara datos personales de contacto en una entidad de cliente según la Ley 29733.
 */
export function maskCustomerContact<T extends Record<string, any>>(data: T): T {
  const result: any = { ...data };

  if (typeof result.dniCliente === "string") {
    result.dniCliente = maskDni(result.dniCliente);
  }
  if (typeof result.dni === "string") {
    result.dni = maskDni(result.dni);
  }
  if ("telefono" in result) {
    result.telefono = maskPhone(result.telefono);
  }
  if ("correo" in result) {
    result.correo = maskEmail(result.correo);
  }
  if ("clienteTelefono" in result) {
    result.clienteTelefono = maskPhone(result.clienteTelefono);
  }
  if ("clienteCorreo" in result) {
    result.clienteCorreo = maskEmail(result.clienteCorreo);
  }

  return result as T;
}
