"use server";

import {
  registerSupplier,
  modifySupplier,
  linkProductToSupplier,
  unlinkProductFromSupplier,
  fetchSupplierDetail,
  fetchAvailableProductsForLinking,
  ServiceResult,
} from "@/lib/services/supplier.service";
import {
  SupplierInput,
  SupplierProductAssociationInput,
} from "@/lib/validations/entity.schema";
import { SupplierDetail } from "@/types/entities";

export async function createSupplierAction(
  data: SupplierInput
): Promise<ServiceResult<{ idProveedor: number }>> {
  return registerSupplier(data);
}

export async function updateSupplierAction(
  id: number,
  data: SupplierInput
): Promise<ServiceResult<{ idProveedor: number }>> {
  return modifySupplier(id, data);
}

export async function associateProductAction(
  data: SupplierProductAssociationInput
): Promise<ServiceResult<{ success: boolean }>> {
  return linkProductToSupplier(data);
}

export async function dissociateProductAction(
  idProveedor: number,
  codbarras: string
): Promise<ServiceResult<{ success: boolean }>> {
  return unlinkProductFromSupplier(idProveedor, codbarras);
}

export async function getSupplierDetailAction(
  id: number
): Promise<ServiceResult<SupplierDetail>> {
  const detail = await fetchSupplierDetail(id);
  if (!detail) {
    return { success: false, error: "Proveedor no encontrado.", statusCode: 404 };
  }
  return { success: true, data: detail, statusCode: 200 };
}

export async function getAvailableProductsForLinkingAction(): Promise<
  ServiceResult<{ codbarras: string; nombre: string; precio: number }[]>
> {
  const products = await fetchAvailableProductsForLinking();
  return { success: true, data: products, statusCode: 200 };
}
