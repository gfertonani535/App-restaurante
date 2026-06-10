import { Link } from 'react-router-dom';

export function PagePlaceholder({ title, description, children, backTo = '/admin' }) {
  return (
    <section className="grid gap-4">
      <div className="grid gap-2">
        <p className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-copy">Ruta renderizada</p>
        <h1 className="text-3xl font-bold leading-tight tracking-normal text-foreground">{title}</h1>
        {description ? <p className="max-w-2xl text-base leading-7 text-copy">{description}</p> : null}
      </div>

      {children ? <div className="rounded-md border bg-card p-4">{children}</div> : null}

      <Link className="w-fit text-sm font-semibold underline underline-offset-4" to={backTo}>
        Volver
      </Link>
    </section>
  );
}
