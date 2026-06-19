import { Clock, Lock, LogOut, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const socialLinks = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    href: 'https://wa.me/15551234567',
    icon: WhatsappIcon,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: InstagramIcon,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: 'https://facebook.com',
    icon: FacebookIcon,
  },
];

function WhatsappIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4.8 19.2 5.9 15.6a7.4 7.4 0 1 1 2.8 2.7l-3.9.9Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M9.2 8.7c.2-.4.4-.5.7-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.4.5c-.1.1-.1.3 0 .5.4.7 1 1.3 1.7 1.7.2.1.4.1.5 0l.5-.4c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.6v.4c0 .4-.2.6-.5.8-.6.4-1.3.5-2.1.3-2.5-.6-5-3.1-5.6-5.6-.2-.7 0-1.4.3-2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect width="16" height="16" x="4" y="4" rx="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="7" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M14.2 8.2h2.1V4.8h-2.7c-3 0-4.5 1.8-4.5 4.4v2H6.7v3.7h2.4v5.3h3.9v-5.3h2.9l.5-3.7H13V9.6c0-.9.4-1.4 1.2-1.4Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FooterSection({ title, children }) {
  return (
    <section className="border-b border-white/10 py-6 first:pt-0 md:border-b-0 md:border-r md:py-0 md:pr-8 md:last:border-r-0 md:last:pr-0">
      <h2 className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">{title}</h2>
      {children}
    </section>
  );
}

function IconText({ icon: Icon, children }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] md:size-8">
        <Icon className="size-4 md:size-4" strokeWidth={2.3} aria-hidden="true" />
      </span>
      <span className="text-sm font-medium leading-tight tracking-normal text-white md:text-sm ">{children}</span>
    </div>
  );
}

export function PublicMenuFooter({ isAuthenticated, onToggleSession }) {
  const SessionIcon = isAuthenticated ? LogOut : Lock;
  const sessionLabel = isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión';

  return (
    <footer className="relative left-1/2 right-1/2 mt-8 w-screen -translate-x-1/2 bg-[#111315] px-5 py-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-0 md:grid-cols-[1.15fr_1.15fr_0.8fr] md:gap-8">
          <FooterSection title="Contacto y Ubicación">
            <div className="grid gap-4">
              <IconText icon={Phone}>+1 (555) 123-4567</IconText>
              <IconText icon={MapPin}>123 Gourmet Ave, Food City</IconText>
            </div>
          </FooterSection>

          <FooterSection title="Horarios">
            <IconText icon={Clock}>{'Lun\u2013Dom: 12:00 PM - 11:00 PM'}</IconText>
          </FooterSection>

          <FooterSection title="Seguinos">
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <a
                    aria-label={link.label}
                    className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:size-9"
                    href={link.href}
                    key={link.id}
                    rel="noreferrer"
                    target="_blank"
                    title={link.label}
                  >
                    <Icon className="size-6 md:size-6" />
                  </a>
                );
              })}
            </div>
          </FooterSection>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 text-center md:flex-row md:text-left">
          <p className="order-2 max-w-full text-[10px] font-medium uppercase leading-4 tracking-[0.1em] text-white/35 [overflow-wrap:anywhere] md:order-1 md:text-xs">
            © 2026 RestaurantOS. Todos los derechos reservados.
          </p>
          <button
            className={cn(
              'order-1 inline-flex min-h-9 items-center justify-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/50 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 md:order-2',
              isAuthenticated && 'text-white/60',
            )}
            onClick={onToggleSession}
            type="button"
          >
            <SessionIcon className="size-4" strokeWidth={2} aria-hidden="true" />
            {sessionLabel}
          </button>
        </div>
      </div>
    </footer>
  );
}
