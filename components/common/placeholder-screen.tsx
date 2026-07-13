export function PlaceholderScreen({ title, description = "이 화면은 초기 개발을 위한 placeholder입니다." }: { title: string; description?: string }) {
  return <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <div className="mb-6 rounded-3xl border-2 border-dashed border-ink/30 bg-white/70 px-8 py-10">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-ink/50">CatchCash</p>
      <h1 className="text-3xl font-black">{title}</h1>
      <p className="mt-4 text-sm text-ink/60">{description}</p>
    </div>
  </section>;
}
