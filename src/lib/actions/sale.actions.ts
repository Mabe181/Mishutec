"use server";

import {
  fetchSaleDetail,
  createSaleTransactional,
  ServiceResult,
} from "@/lib/services/sale.service";
import { getSession } from "@/lib/auth/session";
import { SaleInput } from "@/lib/validations/sale.schema";
import { TransactionalSaleResult } from "@/lib/repositories/sale-transaction.repository";
import { SaleDetail } from "@/types/sales";
import { maskCustomerContact } from "@/lib/formatters";

/**
 * Server Action para registrar una venta transaccional en SQL Server (Fase 6B).
 */
export async function createSaleAction(
  data: SaleInput
): Promise<ServiceResult<TransactionalSaleResult>> {
  return createSaleTransactional(data);
}

/**
 * Server Action para consultar el detalle y conciliación de una venta.
 */
export async function getSaleDetailAction(
  idVenta: number
): Promise<ServiceResult<SaleDetail>> {
  const detail = await fetchSaleDetail(idVenta);
  if (!detail) {
    return {
      success: false,
      error: "La venta solicitada no existe o no pudo ser recuperada.",
      statusCode: 404,
    };
  }

  // Comprobar si hay sesión para proteger datos personales del cliente
  const session = await getSession();
  if (!session) {
    // Si no está autenticado, enmascaramos datos del cliente (Ley 29733)
    const maskedDetail: SaleDetail = maskCustomerContact(detail);
    return {
      success: true,
      data: maskedDetail,
      statusCode: 200,
    };
  }

  return {
    success: true,
    data: detail,
    statusCode: 200,
  };
}
