export default function ListSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      <div className="h-9 w-48 rounded-xl bg-[#efeae3]" />
      <div className="mt-3 h-4 w-72 max-w-full rounded bg-[#efeae3]" />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="h-36 rounded-3xl bg-[#efeae3]" />
        <div className="h-36 rounded-3xl bg-[#efeae3]" />
        <div className="h-36 rounded-3xl bg-[#efeae3]" />
      </div>
    </div>
  );
}
