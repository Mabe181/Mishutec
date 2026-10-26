"use server";

import { getSession } from "@/lib/auth/session";
import {
  getReportsPageData,
  generateReportCsv,
  ReportCsvType,
} from "@/lib/services/report.service";
import { ReportFilterParams, CompleteReportsPageData } from "@/types/reports";

export interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Server Action para consultar datos analíticos con filtros dinámicos (Fase 8).
 * 100% solo lectura, protege datos personales según sesión administrativa.
 */
export async function getFilteredReportsAction(
  filters: ReportFilterParams
): Promise<ActionResponse<CompleteReportsPageData>> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "Acceso denegado: se requiere sesión administrativa activa.",
      };
    }
    const data = await getReportsPageData(filters, true);
    return {
      success: true,
      data,
    };
  } catch (err: any) {
    console.error("Error al obtener datos de reportes:", err);
    return {
      success: false,
      error: err?.message || "Error al procesar la analítica comercial",
    };
  }
}

/**
 * Server Action para exportar datos en formato CSV con sanitización y UTF-8 BOM.
 */
export async function exportReportCsvAction(
  type: ReportCsvType,
  filters: ReportFilterParams
): Promise<ActionResponse<{ filename: string; content: string }>> {
  try {
    const session = await getSession();
    if (!session) {
      return {
        success: false,
        error: "Acceso denegado: se requiere sesión administrativa activa.",
      };
    }
    const result = await generateReportCsv(type, filters, true);
    return {
      success: true,
      data: result,
    };
  } catch (err: any) {
    console.error("Error al generar reporte CSV:", err);
    return {
      success: false,
      error: err?.message || "Error al generar archivo CSV",
    };
  }
}
