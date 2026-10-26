import { NextResponse } from "next/server";
import { testDbDiagnostics } from "@/lib/db";

// Exclusivamente runtime Node.js, nunca Edge
export const runtime = "nodejs";

export async function GET() {
  try {
    const diagnostics = await testDbDiagnostics();
    // Respuesta sanitizada: no expone credenciales, rutas internas, nombres de máquina ni usuarios de Windows
    return NextResponse.json(
      {
        status: diagnostics.success ? "healthy" : "unhealthy",
        service: "Mishutec SaaS Enterprise",
        timestamp: diagnostics.timestamp,
        checks: {
          databaseConnected: diagnostics.success,
          catalogAccessible: diagnostics.productCount > 0,
        },
      },
      { status: diagnostics.success ? 200 : 503 }
    );
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        service: "Mishutec SaaS Enterprise",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
