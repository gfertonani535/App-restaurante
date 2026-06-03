import { Download, Filter, Plus } from 'lucide-react';
import { SectionHeading } from '@/components/common/SectionHeading.jsx';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DialogPreview } from '@/components/ui/dialog-preview';
import { Input } from '@/components/ui/input';
import { Faq } from './Faq.jsx';

export function ComponentShowcase() {
  return (
    <section className="mt-10 border-t border-surface-high py-8" aria-labelledby="showcase-heading">
      <SectionHeading eyebrow="Design System" title="Componentes base" id="showcase-heading" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button>
              <Plus className="size-4" aria-hidden="true" />
              Primary
            </Button>
            <Button variant="secondary">
              <Filter className="size-4" aria-hidden="true" />
              Secondary
            </Button>
            <Button variant="ghost">
              <Download className="size-4" aria-hidden="true" />
              Ghost
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="grid gap-2">
              <span className="text-xs font-semibold uppercase leading-none tracking-[0.05em]">Buscar producto</span>
              <Input placeholder="Pizza Margherita" />
              <span className="text-sm text-copy">Campo estandar del sistema.</span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cards</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="m-0 text-copy">Superficie blanca, borde de baja intensidad y estados definidos por contraste.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Alert title="Producto disponible" variant="success">
              El item ya puede verse en el menu.
            </Alert>
            <Alert title="Stock bajo" variant="destructive">
              Revisar disponibilidad antes del turno.
            </Alert>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Modal</CardTitle>
          </CardHeader>
          <CardContent>
            <DialogPreview title="Confirmar accion" confirmLabel="Guardar">
              Vista estatica del patron modal que se reutilizara en flujos de administracion.
            </DialogPreview>
          </CardContent>
        </Card>
      </div>

      <Faq />
    </section>
  );
}
