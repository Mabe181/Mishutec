"use server";

import {
  executeInventoryEntry,
  executeInventoryExit,
  ServiceResult,
} from "@/lib/services/inventory-mutation.service";
import { MovementResult } from "@/lib/repositories/inventory-mutation.repository";
import { InventoryMovementInput } from "@/lib/validations/inventory-mutation.schema";

export async function recordInventoryEntryAction(
  data: InventoryMovementInput
): Promise<ServiceResult<MovementResult>> {
  return executeInventoryEntry(data);
}

export async function recordInventoryExitAction(
  data: InventoryMovementInput
): Promise<ServiceResult<MovementResult>> {
  return executeInventoryExit(data);
}
