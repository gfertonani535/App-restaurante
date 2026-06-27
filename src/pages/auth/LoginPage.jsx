import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from '@/components/common/FormField.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Input } from '@/components/ui/input.jsx';
import { supabase } from '@/lib/supabase.js';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!supabase) {
      setLoading(false);
      setError('Supabase no está configurado. Completá el archivo .env.local.');
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (signInError) {
      setError('Credenciales incorrectas. Intentá de nuevo.');
      return;
    }

    navigate('/admin/dashboard');
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-950">RestaurantOS</h1>
          <p className="mt-1 text-sm text-neutral-500">Iniciá sesión para continuar</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormField htmlFor="email" label="Email">
            <Input
              autoComplete="email"
              className="rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@restaurante.com"
              required
              type="email"
              value={email}
            />
          </FormField>

          <FormField htmlFor="password" label="Contraseña">
            <Input
              autoComplete="current-password"
              className="rounded-lg border-neutral-200 px-3 py-2 text-sm focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
              type="password"
              value={password}
            />
          </FormField>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <Button className="mt-2 rounded-lg px-4 py-2.5 text-sm font-semibold" disabled={loading} type="submit">
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>
      </div>
    </div>
  );
}
