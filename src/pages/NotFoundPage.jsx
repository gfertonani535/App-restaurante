import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-xl place-items-center px-5 text-center">
      <section className="grid gap-4">
        <h1 className="text-4xl font-bold">Ruta no encontrada</h1>
        <p className="text-copy">La vista solicitada no existe dentro del mapa de navegacion actual.</p>
        <Link className="font-semibold underline underline-offset-4" to="/menu">
          Volver al menu
        </Link>
      </section>
    </main>
  );
}
