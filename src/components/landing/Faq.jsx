export function Faq() {
  return (
    <section className="mt-8 grid gap-2" aria-labelledby="faq-heading">
      <h2 className="m-0 mb-2 text-2xl font-semibold leading-[1.3]" id="faq-heading">
        FAQ
      </h2>
      <details className="rounded-md border bg-card p-4">
        <summary className="cursor-pointer font-semibold">Que alcance tiene esta entrega?</summary>
        <p className="mt-2 text-copy">Solo incluye la landing del menu digital y el sistema visual reutilizable.</p>
      </details>
      <details className="rounded-md border bg-card p-4">
        <summary className="cursor-pointer font-semibold">Esta conectada a una base de datos?</summary>
        <p className="mt-2 text-copy">No. En esta fase los datos son estaticos para validar arquitectura y estilo.</p>
      </details>
    </section>
  );
}
