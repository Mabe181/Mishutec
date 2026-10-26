export default function ProductosLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-2">
          <div className="h-7 w-56 bg-slate-800 rounded-md" />
          <div className="h-4 w-96 bg-slate-800/60 rounded-md" />
        </div>
        <div className="h-8 w-44 bg-slate-800 rounded-lg" />
      </div>

      {/* Filters Skeleton */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 flex-1 bg-slate-800 rounded-lg" />
          <div className="h-10 w-28 bg-slate-800 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
          <div className="h-9 bg-slate-800/70 rounded-lg" />
          <div className="h-9 bg-slate-800/70 rounded-lg" />
          <div className="h-9 bg-slate-800/70 rounded-lg" />
          <div className="h-9 bg-slate-800/70 rounded-lg" />
          <div className="h-9 bg-slate-800/70 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden p-4 space-y-3">
        <div className="h-8 bg-slate-800/80 rounded-md" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-slate-800/40 rounded-md" />
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between items-center py-2">
        <div className="h-4 w-40 bg-slate-800 rounded" />
        <div className="h-8 w-32 bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}
