export function SettingsSectionIntro({ title, description }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold text-neutral-950">{title}</h2>
      {description ? <p className="mt-1 text-sm text-neutral-500">{description}</p> : null}
    </div>
  );
}
