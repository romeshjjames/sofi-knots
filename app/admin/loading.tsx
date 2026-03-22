function AdminLoadingCard() {
  return <div className="h-28 animate-pulse rounded-[28px] border border-[#e7eaee] bg-white/80" />;
}

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#f6f7f8] p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <div className="h-20 animate-pulse rounded-[28px] border border-[#e7eaee] bg-white/80" />
        <div className="grid gap-6 lg:grid-cols-4">
          <AdminLoadingCard />
          <AdminLoadingCard />
          <AdminLoadingCard />
          <AdminLoadingCard />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="h-[420px] animate-pulse rounded-[28px] border border-[#e7eaee] bg-white/80" />
          <div className="space-y-6">
            <div className="h-48 animate-pulse rounded-[28px] border border-[#e7eaee] bg-white/80" />
            <div className="h-48 animate-pulse rounded-[28px] border border-[#e7eaee] bg-white/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
