"use server";

import {
  registerClient,
  modifyClient,
  fetchClientDetail,
  ServiceResult,
} from "@/lib/services/client.service";
import { getSession } from "@/lib/auth/session";
import { ClientInput, ClientUpdateInput } from "@/lib/validations/entity.schema";
import { ClientDetail } from "@/types/entities";

export async function createClientAction(
  data: ClientInput
): Promise<ServiceResult<{ dni: string }>> {
  return registerClient(data);
}

export async function updateClientAction(
  dni: string,
  data: ClientUpdateInput
): Promise<ServiceResult<{ dni: string }>> {
  return modifyClient(dni, data);
}

export async function getClientDetailAction(
  dni: string
): Promise<ServiceResult<ClientDetail>> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Acceso denegado: se requiere autenticación administrativa para consultar datos personales de clientes.",
      statusCode: 401,
    };
  }

  const detail = await fetchClientDetail(dni);
  if (!detail) {
    return { success: false, error: "Cliente no encontrado.", statusCode: 404 };
  }
  return { success: true, data: detail, statusCode: 200 };
}
