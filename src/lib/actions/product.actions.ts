"use server";

import {
  createProductService,
  updateProductService,
  discontinueProductService,
  MutationResult,
} from "@/lib/services/product-mutation.service";
import {
  CreateProductInput,
  UpdateProductInput,
} from "@/lib/validations/product-mutation.schema";

export async function createProductAction(
  data: CreateProductInput
): Promise<MutationResult> {
  return createProductService(data);
}

export async function updateProductAction(
  data: UpdateProductInput
): Promise<MutationResult> {
  return updateProductService(data);
}

export async function discontinueProductAction(
  codbarras: string
): Promise<MutationResult> {
  return discontinueProductService(codbarras);
}
