/** Esqueleto mientras la portada trae sus datos. */
export default function LoadingHome() {
  return (
    <div className="flex flex-1 flex-col bg-brand-cream">
      <div className="flex flex-col items-center gap-6 bg-brand-kraft px-5 py-16">
        <div className="h-36 w-36 animate-pulse rounded-full bg-brand-sand" />
        <div className="h-4 w-48 animate-pulse rounded bg-brand-sand" />
        <div className="h-14 w-full max-w-md animate-pulse rounded-md bg-brand-sand" />
        <div className="h-11 w-56 animate-pulse rounded-full bg-brand-sand" />
      </div>
      <div className="mx-auto mt-14 grid w-full max-w-5xl grid-cols-1 gap-5 px-5 sm:grid-cols-3 sm:px-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="aspect-[4/5] w-full animate-pulse rounded-[14px] bg-brand-sand" />
        ))}
      </div>
    </div>
  );
}
