export function SectionHeading({ eyebrow, title, id }) {
  return (
    <div className="mb-6">
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase leading-none tracking-[0.05em] text-copy">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="m-0 text-2xl font-semibold leading-[1.3]" id={id}>
        {title}
      </h2>
    </div>
  );
}
