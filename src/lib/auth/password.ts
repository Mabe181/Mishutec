import crypto from "crypto";

/**
 * Genera un hash seguro para la contraseña del administrador usando scrypt con salt aleatorio.
 * Formato resultante: salt_hex:hash_hex
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

/**
 * Comprueba si la contraseña ingresada coincide con el hash almacenado en formato salt:hash.
 * Utiliza timingSafeEqual para mitigar ataques de temporización (timing attacks).
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) {
    return false;
  }

  const [salt, key] = storedHash.split(":");
  if (!salt || !key) {
    return false;
  }

  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = crypto.scryptSync(password, salt, 64);

    if (keyBuffer.length !== derivedKey.length) {
      return false;
    }

    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (error) {
    console.error("Error al verificar hash de contraseña:", error);
    return false;
  }
}
