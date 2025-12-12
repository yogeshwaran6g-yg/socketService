const DashboardSkeleton = () => {
  return (
    <div className="light">
      <div className="bg-background-light dark:bg-background-dark min-h-screen font-display text-[#E5E5E5] animate-pulse">
        <div className="relative flex min-h-screen w-full flex-col items-center">
          <div className="layout-container flex h-full w-full max-w-7xl grow flex-col p-4 md:p-6 lg:p-8">

            {/* HEADER */}
            <header className="flex w-full items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="size-6 rounded bg-white/10" />
                <div className="h-5 w-40 rounded bg-white/10" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-28 rounded bg-white/10" />
                <div className="h-8 w-8 rounded-lg bg-white/10" />
                <div className="h-8 w-8 rounded-lg bg-white/10" />
              </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex flex-1 flex-col items-center justify-center gap-8 py-8">

              {/* GAME SELECTION */}
              <div className="flex flex-1 flex-row justify-center gap-8 py-8">
                <div className="flex flex-col">
                  <div className="h-6 w-80 rounded bg-white/10" />
                  <br />
                  <div className="mt-2 grid md:grid-cols-5 sm:grid-cols-1 gap-5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-12 w-[120px] rounded-lg bg-white/10"
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* STATS CARDS */}
              <div className="flex w-full max-w-4xl flex-wrap gap-4 md:gap-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex min-w-[200px] flex-1 flex-col gap-3 rounded-xl bg-white/5 p-6"
                  >
                    <div className="h-4 w-24 rounded bg-white/10" />
                    <div className="h-8 w-20 rounded bg-white/10" />
                  </div>
                ))}
              </div>

              {/* TIMER */}
              <div className="flex w-full max-w-sm flex-col items-center gap-4 py-6">
                <div className="h-4 w-32 rounded bg-white/10" />
                <div className="flex w-full items-center justify-center gap-4">
                  {[1, 2, 3].map((i) => (
                    <div className="flex grow basis-0 flex-col items-stretch gap-2" key={i}>
                      <div className="flex h-20 items-center justify-center rounded-lg bg-white/10" />
                      <div className="h-3 w-10 rounded bg-white/10 self-center" />
                    </div>
                  ))}
                </div>
              </div>

              {/* CONTROL PANELS */}
              <div className="grid w-full max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">

                {/* MANUAL OUTCOME */}
                <div className="flex w-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="h-5 w-40 rounded bg-white/10" />
                  <div className="h-4 w-60 rounded bg-white/10" />
                  <div className="mt-2 grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-12 rounded-lg bg-white/10" />
                    ))}
                  </div>
                </div>

                {/* PREDEFINED OUTCOME */}
                <div className="flex w-full flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="h-5 w-56 rounded bg-white/10" />
                  <div className="h-4 w-60 rounded bg-white/10" />

                  <div className="mt-2 flex flex-col gap-4 sm:flex-row">
                    <div className="h-12 flex-1 rounded-lg bg-white/10" />
                    <div className="h-12 flex-1 rounded-lg bg-white/10" />
                  </div>

                  <div className="mt-2 h-12 w-full rounded-lg bg-white/10" />
                </div>
              </div>
            </main>

            {/* FOOTER */}
            <footer className="mt-auto flex w-full flex-col gap-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-28 rounded bg-white/10" />
                <div className="h-4 w-20 rounded bg-white/10" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-white/10"
                  />
                ))}
              </div>
            </footer>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
