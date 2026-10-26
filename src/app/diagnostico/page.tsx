import { testDbDiagnostics, getPool } from "@/lib/db";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import {
  Database,
  Server,
  UserCheck,
  Package,
  ShoppingCart,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export const runtime = "nodejs";

interface ProductRow {
  Codbarras_prod: string;
  Nombre_prod: string;
  Precio: number;
  Stock: number;
  Garantia_meses: number;
  Estado: string;
  Categoria: string;
  Marca: string;
}

async function getProductsPreview(): Promise<ProductRow[]> {
  try {
    const pool = await getPool();
    const result = await pool.request().query<ProductRow>(`
      SELECT 
        p.Codbarras_prod,
        p.Nombre_prod,
        p.Precio,
        p.Stock,
        p.Garantia_meses,
        e.Estado,
        c.Nombre_cat AS Categoria,
        m.Nombre_marca AS Marca
      FROM dbo.Producto p
      JOIN dbo.Estado_Prod e ON p.ID_estado_prod = e.ID_estado_prod
      JOIN dbo.Categoria c ON p.ID_categoria = c.ID_categoria
      JOIN dbo.Marca m ON p.ID_marca = m.ID_marca
      ORDER BY p.Codbarras_prod ASC
    `);
    return result.recordset;
  } catch {
    return [];
  }
}

export default async function DiagnosticoPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login?from=/diagnostico");
  }

  const diagnostics = await testDbDiagnostics();
  const products = diagnostics.success ? await getProductsPreview() : [];

  const isValidDb = diagnostics.activeDatabase === "MishutecT2";
  const isValidProducts = diagnostics.productCount === 10;
  const isValidSales = diagnostics.saleCount === 5;
  const isAllValid = diagnostics.success && isValidDb && isValidProducts && isValidSales;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Cabecera Principal */}
        <header className="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  MISHUTEC &bull; Diagnóstico Técnico
                </h1>
                <p className="text-sm text-slate-400">
                  Panel de Verificación de Capa de Conexión a SQL Server Express
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors shadow-md shadow-cyan-500/20"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Ir al Dashboard
            </Link>
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                isAllValid
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                  : "bg-rose-950/60 text-rose-300 border-rose-800"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isAllValid ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                }`}
              />
              {isAllValid ? "Conexión Validada" : "Error de Conexión"}
            </span>
          </div>
        </header>

        {/* Tarjetas de Métricas Clave */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Base de Datos</span>
              <Database className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-semibold tracking-tight text-white">
                {diagnostics.activeDatabase}
              </span>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                {isValidDb ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 inline" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-rose-400 inline" />
                )}
                {isValidDb ? "MishutecT2 verificada" : "Base no coincide"}
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>Usuario Autenticado</span>
              <UserCheck className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-3">
              <span className="text-base font-semibold tracking-tight text-white truncate block">
                {diagnostics.windowsUser}
              </span>
              <p className="text-xs text-slate-400 mt-1">Windows Integrated Auth</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>dbo.Producto</span>
              <Package className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-white">
                {diagnostics.productCount}
              </span>
              <span className="text-xs text-slate-400">/ 10 registros</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
              <span>dbo.Venta</span>
              <ShoppingCart className="h-4 w-4 text-violet-400" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold tracking-tight text-white">
                {diagnostics.saleCount}
              </span>
              <span className="text-xs text-slate-400">/ 5 registros</span>
            </div>
          </div>
        </div>

        {/* Tabla de Productos Existentes */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Productos en dbo.Producto ({products.length} registros)</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Latencia: {diagnostics.latencyMs} ms
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Marca</th>
                  <th className="py-2.5 px-3 text-right">Precio (S/.)</th>
                  <th className="py-2.5 px-3 text-center">Stock</th>
                  <th className="py-2.5 px-3 text-center">Garantía</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {products.map((p) => (
                  <tr key={p.Codbarras_prod} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{p.Codbarras_prod}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{p.Nombre_prod}</td>
                    <td className="py-2.5 px-3 text-slate-300">{p.Categoria}</td>
                    <td className="py-2.5 px-3 text-slate-300">{p.Marca}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-cyan-400">
                      S/. {Number(p.Precio).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono">
                      {p.Stock}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-400">
                      {p.Garantia_meses} m
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          p.Estado === "Disponible"
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {p.Estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
