export function DemoAccessSection() {
  const demoUrl = process.env.NEXT_PUBLIC_DEMO_URL;
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD;

  if (!demoUrl) {
    return null;
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-border bg-card/30 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">
                Live Demo
              </p>
              <h2 className="text-2xl font-bold md:text-3xl">
                Try Frost right now
              </h2>
              <p className="mt-2 text-muted-foreground">
                No signup. Demo resets every hour.
              </p>
              {demoPassword && (
                <p className="mt-3 text-sm text-muted-foreground">
                  Password:{" "}
                  <code className="rounded bg-background px-2 py-1 text-foreground">
                    {demoPassword}
                  </code>
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 font-medium text-background transition-all hover:bg-white/90"
              >
                Open Live Demo
              </a>
              <a
                href="#install"
                className="inline-flex items-center justify-center rounded-lg border border-border px-6 py-3 font-medium text-foreground transition-all hover:bg-card/50"
              >
                Install Frost
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
