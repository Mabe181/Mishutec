import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { sanitizeRedirectUrl } from "@/lib/auth/redirect";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Inicio de Sesión Administrativa | MISHUTEC",
  description: "Acceso seguro al panel de administración del sistema comercial Mishutec.",
};

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await getSession();
  const params = await searchParams;
  const fromUrl = sanitizeRedirectUrl(params?.from);

  if (session) {
    redirect(fromUrl);
  }

  const dbName = process.env.DB_NAME || "MishutecT2_Aceptacion";
  const isAcademic = dbName.toLowerCase() === "mishutect2";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-cyan-500/20 selection:text-cyan-300">
      <div className="w-full max-w-md space-y-6">
        {/* Encabezado Institucional */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
            <span className="text-2xl font-black font-mono tracking-tighter">M</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Mishutec Commercial POS
          </h1>
          <p className="text-xs text-slate-400">
            Módulo de Administración y Control Comercial Seguro
          </p>
        </div>

        {/* Formulario de Login */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          <LoginForm fromUrl={fromUrl} />
        </div>

        {/* Footer Técnico */}
        <div className="text-center text-[11px] text-slate-500 space-y-1">
          <div>
            Base activa: <span className="font-semibold text-slate-400">{dbName}</span>{" "}
            ({isAcademic ? "Modo Protegido" : "Entorno Aceptación"})
          </div>
          <div>SQL Server Express &bull; Windows Authentication &bull; Next.js 16</div>
        </div>
      </div>
    </main>
  );
}
