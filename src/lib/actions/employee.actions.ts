"use server";

import {
  registerEmployee,
  modifyEmployee,
  fetchEmployeeDetail,
  ServiceResult,
} from "@/lib/services/employee.service";
import { getSession } from "@/lib/auth/session";
import {
  EmployeeInput,
  EmployeeUpdateInput,
} from "@/lib/validations/entity.schema";
import { EmployeeDetail } from "@/types/entities";

export async function createEmployeeAction(
  data: EmployeeInput
): Promise<ServiceResult<{ idEmpleado: number }>> {
  return registerEmployee(data);
}

export async function updateEmployeeAction(
  id: number,
  data: EmployeeUpdateInput
): Promise<ServiceResult<{ idEmpleado: number }>> {
  return modifyEmployee(id, data);
}

export async function getEmployeeDetailAction(
  id: number
): Promise<ServiceResult<EmployeeDetail>> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      error: "Acceso denegado: se requiere autenticación administrativa para consultar expedientes de personal.",
      statusCode: 401,
    };
  }

  const detail = await fetchEmployeeDetail(id);
  if (!detail) {
    return { success: false, error: "Empleado no encontrado.", statusCode: 404 };
  }
  return { success: true, data: detail, statusCode: 200 };
}
