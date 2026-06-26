import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    } else {
      navigate('/admin/dashboard');
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-950">RestaurantOS</h1>
          <p className="mt-1 text-sm text-neutral-500">Iniciá sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
              placeholder="admin@restaurante.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none transition-colors focus:border-neutral-950 focus:ring-2 focus:ring-neutral-950/10"
              placeholder="••••••••"
            />
          </div>

          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-lg bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
