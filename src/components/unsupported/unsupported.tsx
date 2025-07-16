export function Unsupported() {
  return (
    <section className="flex h-dvh flex-col items-center justify-center space-y-6 p-8 text-center">
      <h2 className="text-2xl lg:text-4xl font-mono font-bold">
        Unsupported Browser
      </h2>
      <p className="text-sm lg:text-base font-mono font-light">
        Sorry, we couldn{"'"}t load this experience. Your browser doesn{"'"}t
        support WebGPU.
      </p>
    </section>
  );
}
