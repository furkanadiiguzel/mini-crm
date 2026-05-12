function Base({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-neutral-200 rounded ${className}`} />;
}
function Text({ className = "" }: { className?: string }) {
  return <Base className={`h-4 ${className}`} />;
}
function Title({ className = "" }: { className?: string }) {
  return <Base className={`h-6 ${className}`} />;
}
function AvatarSkeleton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const s = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12" }[size];
  return <Base className={`rounded-full shrink-0 ${s}`} />;
}
function CardSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-neutral-200 p-6 animate-pulse space-y-3 ${className}`}>
      <Base className="h-5 w-1/3" /><Base className="h-4 w-2/3" /><Base className="h-4 w-1/2" />
    </div>
  );
}
function TableRow({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-neutral-100">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-6 py-4"><Base className="h-4 w-3/4" /></td>
      ))}
    </tr>
  );
}
function KpiCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 flex overflow-hidden animate-pulse">
      <div className="w-1.5 bg-neutral-200 shrink-0" />
      <div className="flex items-center gap-4 px-5 py-5 flex-1">
        <Base className="w-11 h-11 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1"><Base className="h-3 w-1/2" /><Base className="h-7 w-1/3" /></div>
      </div>
    </div>
  );
}
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <Base className="h-8 w-36" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <KpiCardSkeleton key={i} />)}
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-6 space-y-4">
        <Base className="h-5 w-40" /><Base className="h-64 w-full rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-100"><Base className="h-5 w-48" /></div>
        <table className="w-full"><tbody>{[...Array(5)].map((_, i) => <TableRow key={i} cols={4} />)}</tbody></table>
      </div>
    </div>
  );
}

const Skeleton = { Base, Text, Title, Avatar: AvatarSkeleton, Card: CardSkeleton, TableRow, KpiCard: KpiCardSkeleton, Dashboard: DashboardSkeleton };
export default Skeleton;
