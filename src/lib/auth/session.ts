import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "mishutec_session";
const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 horas

export interface SessionPayload {
  username: string;
  role: "admin";
  issuedAt: number;
}

export class UnauthorizedError extends Error {
  constructor(message = "Sesión no autorizada o expirada") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class AuthConfigurationError extends Error {
  constructor(message = "Autenticación administrativa no configurada en variables de entorno") {
    super(message);
    this.name = "AuthConfigurationError";
  }
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new AuthConfigurationError(
      "AUTH_SESSION_SECRET no configurada o menor a 32 caracteres en .env.local"
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Crea y firma un JWT de sesión para el usuario administrativo.
 */
export async function createSession(username: string): Promise<string> {
  const secretKey = getSecretKey();
  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(secretKey);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });

  return token;
}

/**
 * Verifica un token JWT de sesión y extrae su payload.
 * Compatible con Node.js y Edge runtime (utilizado por src/proxy.ts).
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    if (!token) return null;
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);

    return {
      username: String(payload.username),
      role: "admin",
      issuedAt: Number(payload.iat),
    };
  } catch (error) {
    return null;
  }
}

/**
 * Obtiene la sesión actual a partir de las cookies HTTP.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    return await verifySessionToken(token);
  } catch (error) {
    // Si el token es inválido o expiró, retornamos null
    return null;
  }
}

/**
 * Cierra la sesión activa eliminando la cookie de sesión.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Guardián de autorización para Server Actions y Route Handlers.
 * Lanza UnauthorizedError si no existe una sesión válida.
 */
export async function requireAdminSession(): Promise<SessionPayload> {
  // 1. Verificar si la autenticación está configurada
  if (!process.env.ADMIN_PASSWORD_HASH || !process.env.AUTH_SESSION_SECRET) {
    throw new AuthConfigurationError(
      "El sistema no tiene configuradas las credenciales de administración en .env.local. Acceso denegado por defecto."
    );
  }

  // 2. Verificar la sesión del usuario
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError(
      "Operación rechazada: Requiere sesión administrativa activa."
    );
  }

  return session;
}
