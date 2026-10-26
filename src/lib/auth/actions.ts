"use server";

import { verifyPassword } from "./password";
import { createSession, destroySession, getSession } from "./session";
import { revalidatePath } from "next/cache";

export interface AuthActionResult {
  success: boolean;
  error?: string;
  user?: { username: string; role: string };
}

/**
 * Server Action para iniciar sesión administrativa.
 */
export async function loginAdminAction(
  prevState: any,
  formData: FormData
): Promise<AuthActionResult> {
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");

  const configuredUser = process.env.ADMIN_USERNAME || "admin";
  const configuredHash = process.env.ADMIN_PASSWORD_HASH;

  if (!configuredHash) {
    return {
      success: false,
      error: "Autenticación administrativa no configurada en el servidor (.env.local). Acceso bloqueado.",
    };
  }

  if (username !== configuredUser) {
    return {
      success: false,
      error: "Credenciales administrativas incorrectas.",
    };
  }

  const isValid = verifyPassword(password, configuredHash);
  if (!isValid) {
    return {
      success: false,
      error: "Credenciales administrativas incorrectas.",
    };
  }

  await createSession(username);
  revalidatePath("/productos");

  return {
    success: true,
    user: { username, role: "admin" },
  };
}

/**
 * Server Action para cerrar sesión administrativa.
 */
export async function logoutAdminAction(): Promise<AuthActionResult> {
  await destroySession();
  revalidatePath("/productos");
  return { success: true };
}

/**
 * Consulta rápida del estado de autenticación.
 */
export async function getSessionStatusAction() {
  const session = await getSession();
  return {
    isAuthenticated: !!session,
    user: session ? { username: session.username, role: session.role } : null,
  };
}
