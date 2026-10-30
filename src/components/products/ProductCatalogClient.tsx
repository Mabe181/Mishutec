"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  PaginatedProductsResult,
  ProductDetail,
  ProductFilterMetadata,
} from "@/types/product";
import { ProductFilters } from "./ProductFilters";
import { ProductTable } from "./ProductTable";
import { ProductPagination } from "./ProductPagination";
import { ProductDetailModal } from "./ProductDetailModal";
import { ProductCreateModal } from "./ProductCreateModal";
import { ProductEditModal } from "./ProductEditModal";
import { ProductDiscontinueModal } from "./ProductDiscontinueModal";
import { LoginModal } from "@/components/auth/LoginModal";
import {
  Loader2,
  PackagePlus,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface ProductCatalogClientProps {
  initialResult: PaginatedProductsResult;
  metadata: ProductFilterMetadata;
  initialSelectedDetail?: ProductDetail | null;
  isAuthenticated?: boolean;
  username?: string | null;
}

export function ProductCatalogClient({
  initialResult,
  metadata,
  initialSelectedDetail = null,
  isAuthenticated = false,
  username = null,
}: ProductCatalogClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estados de Modales con soporte de deep-linking mediante query param
  const modalParam = searchParams.get("modal");
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(
    initialSelectedDetail
  );
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(
    !!initialSelectedDetail && !modalParam
  );
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(modalParam === "create");
  const [isEditOpen, setIsEditOpen] = useState<boolean>(
    modalParam === "edit" && !!initialSelectedDetail
  );
  const [isDiscontinueOpen, setIsDiscontinueOpen] = useState<boolean>(
    modalParam === "discontinue" && !!initialSelectedDetail
  );
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(modalParam === "login");
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  // Mensaje flotante de retroalimentación
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    startTransition(() => {
      router.push(pathname);
    });
  };

  // Cambiar página
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  // Seleccionar producto para abrir ficha técnica
  const handleSelectProduct = async (codbarras: string) => {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(codbarras)}`);
      if (!res.ok) {
        throw new Error("No se pudo obtener la ficha del producto");
      }
      const json = await res.json();
      if (json.success && json.data) {
        setSelectedProduct(json.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      console.error("Error al cargar detalle del producto:", err);
      showFeedback("error", "Error al cargar la ficha técnica.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Acciones desde Ficha Técnica
  const handleOpenEdit = (product: ProductDetail) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setIsDetailOpen(false);
    setIsEditOpen(true);
  };

  const handleOpenDiscontinue = (product: ProductDetail) => {
    if (!isAuthenticated) {
      setIsLoginOpen(true);
      return;
    }
    setIsDetailOpen(false);
    setIsDiscontinueOpen(true);
  };

  // Callbacks tras mutaciones exitosas
  const handleProductCreated = (codbarras: string) => {
    showFeedback("success", `Producto ${codbarras} registrado exitosamente.`);
    router.refresh();
  };

  const handleProductUpdated = (codbarras: string) => {
    showFeedback("success", `Producto ${codbarras} actualizado exitosamente.`);
    router.refresh();
    handleSelectProduct(codbarras);
  };

  const handleProductDiscontinued = (codbarras: string) => {
    showFeedback("success", `Producto ${codbarras} descontinuado.`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Banner de Retroalimentación Flotante */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200 ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs hover:underline opacity-80"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Barra de Acciones Administrativas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-[11px]">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Sesión Activa: {username}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-slate-600 text-[11px]">
              <Lock className="h-3 w-3 text-slate-400" />
              <span>Modo Consulta (Sin autenticar)</span>
            </div>
          )}
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Gestión transaccional con integridad referencial completa
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto sm:justify-end">
          {!isAuthenticated ? (
            <button
              type="button"
              onClick={() => setIsLoginOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold whitespace-nowrap transition-colors shadow-xs"
            >
              <Lock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
              <span>Acceso Admin</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                setIsLoginOpen(true);
              } else {
                setIsCreateOpen(true);
              }
            }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs whitespace-nowrap transition-colors"
          >
            <PackagePlus className="h-4 w-4 shrink-0" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <ProductFilters
        metadata={metadata}
        totalFiltered={initialResult.totalItems}
      />

      {/* Indicador de carga sutil durante transiciones de filtro */}
      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 rounded-xl flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 text-xs shadow-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="font-medium text-slate-700">Actualizando catálogo...</span>
            </div>
          </div>
        )}

        {/* Tabla de Productos */}
        <ProductTable
          products={initialResult.items}
          onSelectProduct={handleSelectProduct}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Paginación */}
      <ProductPagination
        currentPage={initialResult.currentPage}
        totalPages={initialResult.totalPages}
        totalItems={initialResult.totalItems}
        pageSize={initialResult.pageSize}
        onPageChange={handlePageChange}
      />

      {/* Indicador flotante cuando se está cargando el detalle */}
      {isLoadingDetail && (
        <div className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span>Cargando ficha técnica desde SQL Server...</span>
        </div>
      )}

      {/* Modales Transaccionales */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProduct(null);
        }}
        isAuthenticated={isAuthenticated}
        onEdit={handleOpenEdit}
        onDiscontinue={handleOpenDiscontinue}
        onRequestLogin={() => setIsLoginOpen(true)}
      />

      <ProductCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        metadata={metadata}
        isAuthenticated={isAuthenticated}
        onRequestLogin={() => setIsLoginOpen(true)}
        onProductCreated={handleProductCreated}
      />

      <ProductEditModal
        product={selectedProduct}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        metadata={metadata}
        isAuthenticated={isAuthenticated}
        onRequestLogin={() => setIsLoginOpen(true)}
        onProductUpdated={handleProductUpdated}
      />

      <ProductDiscontinueModal
        product={selectedProduct}
        isOpen={isDiscontinueOpen}
        onClose={() => setIsDiscontinueOpen(false)}
        isAuthenticated={isAuthenticated}
        onRequestLogin={() => setIsLoginOpen(true)}
        onProductDiscontinued={handleProductDiscontinued}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
