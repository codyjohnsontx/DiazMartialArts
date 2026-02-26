export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-sm text-black/60">
      <span
        className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-ember"
        aria-hidden="true"
      />
      Loading...
    </div>
  );
}
