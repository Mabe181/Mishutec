import { NextRequest, NextResponse } from "next/server";
import { getProductDetailByBarcode } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barcode: string }> }
) {
  try {
    const { barcode } = await params;
    const cleanBarcode = barcode ? decodeURIComponent(barcode).trim() : "";

    if (!cleanBarcode) {
      return NextResponse.json(
        { success: false, error: "Código de barras requerido" },
        { status: 400 }
      );
    }

    // Validación básica de formato para evitar ataques de desbordamiento
    if (cleanBarcode.length > 20) {
      return NextResponse.json(
        { success: false, error: "Código de barras inválido o excesivamente largo" },
        { status: 400 }
      );
    }

    const product = await getProductDetailByBarcode(cleanBarcode);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: `Producto con código '${cleanBarcode}' no encontrado en el catálogo`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: product },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (error: any) {
    console.error("[API Error] /api/products/[barcode]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno al consultar la información del producto.",
      },
      { status: 500 }
    );
  }
}
