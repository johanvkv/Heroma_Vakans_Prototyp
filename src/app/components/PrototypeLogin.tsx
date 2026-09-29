import { FormEvent, type ReactNode, useState } from 'react';
import './prototype-login.css';

const ACCESS_PASSWORD = 'HeromaVakans#123';
const ACCESS_KEY = 'heroma-prototype-access';

function hasAccess() {
  return typeof window !== 'undefined' && sessionStorage.getItem(ACCESS_KEY) === 'granted';
}

export function PrototypeLogin({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(hasAccess);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password === ACCESS_PASSWORD) {
      sessionStorage.setItem(ACCESS_KEY, 'granted');
      setAuthenticated(true);
      setError(false);
      return;
    }

    setPassword('');
    setError(true);
  }

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <main className="prototype-login-page">
      <section className="prototype-login-card" aria-labelledby="login-title">
        <div className="prototype-login-mark" aria-hidden="true">H</div>
        <p className="prototype-login-eyebrow">Heroma</p>
        <h1 id="login-title">Logga in för att fortsätta</h1>
        <p className="prototype-login-description">
          Ange lösenordet för att få tillgång till prototypen.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="prototype-password">Lösenord</label>
          <input
            id="prototype-password"
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError(false);
            }}
            autoComplete="current-password"
            autoFocus
            aria-invalid={error}
            aria-describedby={error ? 'prototype-login-error' : undefined}
          />
          {error && (
            <p id="prototype-login-error" className="prototype-login-error" role="alert">
              Fel lösenord. Försök igen.
            </p>
          )}
          <button type="submit">Logga in</button>
        </form>
      </section>
    </main>
  );
}
