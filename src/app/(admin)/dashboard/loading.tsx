export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Cabecera Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="h-7 w-64 bg-slate-200 rounded-lg" />
          <div className="h-4 w-96 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-28 bg-slate-200 rounded-lg" />
      </div>

      {/* Grid de 8 KPI Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 h-32 shadow-xs"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-28 bg-slate-200 rounded" />
              <div className="h-7 w-7 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-6 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Grid Gráficos Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 h-80 space-y-4 shadow-xs">
          <div className="h-5 w-48 bg-slate-200 rounded" />
          <div className="h-60 bg-slate-100 rounded-lg" />
        </div>
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 h-80 space-y-4 shadow-xs">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-60 bg-slate-100 rounded-lg" />
        </div>
      </div>

      {/* Grid Tablas Skeletons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 h-72 space-y-4 shadow-xs">
          <div className="h-5 w-44 bg-slate-200 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 h-72 space-y-4 shadow-xs">
          <div className="h-5 w-36 bg-slate-200 rounded" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-slate-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
