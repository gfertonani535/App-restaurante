import { useEffect, useMemo, useState } from 'react';
import { Clock, Globe, Info, Link2, Lock, LogOut, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getPublicRestaurantFooterData } from '@/services/settings.service.js';
import {
  formatBusinessHourGroup,
  getBusinessHourGroupDayLabel,
  groupBusinessHoursBySchedule,
} from '@/utils/businessHours.js';

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

function YoutubeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect x="3.5" y="6.5" width="17" height="11" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" fill="currentColor" />
    </svg>
  );
}

function TiktokIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M14 4v10.2a4 4 0 1 1-3.8-4h.4v3.2h-.4a.8.8 0 1 0 .8.8V4h3Zm0 0c.4 2.5 1.8 4 4 4.5v3.2c-1.6-.2-3-.8-4-1.7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

const socialIconsByProvider = {
  facebook: FacebookIcon,
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  web: Globe,
  website: Globe,
  whatsapp: WhatsappIcon,
  youtube: YoutubeIcon,
};

function normalizeProvider(provider) {
  return String(provider ?? '')
    .trim()
    .toLowerCase();
}

function getSocialIcon(provider) {
  return socialIconsByProvider[normalizeProvider(provider)] ?? Link2;
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
      <span className="text-sm font-medium leading-tight tracking-normal text-white md:text-sm">{children}</span>
    </div>
  );
}

export function PublicMenuFooter({ isAuthenticated, onToggleSession }) {
  const [footerData, setFooterData] = useState({
    settings: null,
    socialLinks: [],
    businessHours: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const SessionIcon = isAuthenticated ? LogOut : Lock;
  const sessionLabel = isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión';

  useEffect(() => {
    let isMounted = true;

    async function loadFooterData() {
      setIsLoading(true);
      setLoadError('');

      try {
        const data = await getPublicRestaurantFooterData();
        if (isMounted) {
          setFooterData(data);
        }
      } catch {
        if (isMounted) {
          setFooterData({ settings: null, socialLinks: [], businessHours: [] });
          setLoadError('No pudimos cargar la información del restaurante.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFooterData();

    return () => {
      isMounted = false;
    };
  }, []);

  const settings = footerData.settings ?? {};
  const restaurantName = settings.restaurantName || 'RestaurantOS';
  const shortDescription = settings.shortDescription || 'Carta digital del restaurante.';
  const address = settings.address || 'Dirección no configurada.';
  const visibleSocialLinks = useMemo(
    () => footerData.socialLinks.filter((link) => link.isActive).slice(0, 4),
    [footerData.socialLinks],
  );
  const businessHourGroups = useMemo(() => groupBusinessHoursBySchedule(footerData.businessHours), [footerData.businessHours]);

  return (
    <footer className="relative left-1/2 right-1/2 mt-8 w-screen -translate-x-1/2 bg-[#111315] px-5 py-8 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        {loadError ? <p className="mb-5 text-sm font-medium text-white/55">{loadError}</p> : null}

        <div className="grid gap-0 md:grid-cols-[1.15fr_1.15fr_0.8fr] md:gap-8">
          <FooterSection title="Contacto y ubicación">
            <div className="grid gap-4">
              {isLoading ? (
                <p className="text-sm font-medium text-white/60">Cargando datos del restaurante...</p>
              ) : (
                <>
                  <IconText icon={Info}>{shortDescription}</IconText>
                  <IconText icon={MapPin}>{address}</IconText>
                </>
              )}
            </div>
          </FooterSection>

          <FooterSection title="Horarios">
            {isLoading ? (
              <IconText icon={Clock}>Cargando horarios...</IconText>
            ) : businessHourGroups.length > 0 ? (
              <div className="grid gap-2">
                {businessHourGroups.map((group) => (
                  <div className="grid gap-1 text-sm font-medium text-white" key={`${group.key}-${group.weekdays.join('-')}`}>
                    <span className="text-white/55">{getBusinessHourGroupDayLabel(group)}</span>
                    <span>{formatBusinessHourGroup(group)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <IconText icon={Clock}>Horarios no configurados.</IconText>
            )}
          </FooterSection>

          <FooterSection title="Seguinos">
            {isLoading ? (
              <p className="text-sm font-medium text-white/60">Cargando redes...</p>
            ) : visibleSocialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {visibleSocialLinks.map((link) => {
                  const Icon = getSocialIcon(link.provider);

                  return (
                    <a
                      aria-label={link.label}
                      className="grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 md:size-9"
                      href={link.url}
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
            ) : (
              <p className="text-sm font-medium text-white/60">No hay redes configuradas.</p>
            )}
          </FooterSection>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 text-center md:flex-row md:text-left">
          <p className="order-2 max-w-full text-[10px] font-medium uppercase leading-4 tracking-[0.1em] text-white/35 [overflow-wrap:anywhere] md:order-1 md:text-xs">
            © 2026 {restaurantName}. Todos los derechos reservados.
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
