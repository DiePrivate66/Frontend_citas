import { useState } from 'react'
import type { FormEvent } from 'react'
import { apiFetch } from '../lib/api'

type LoginResponse = {
  access_token: string
  user: {
    name: string
    email: string
    role: string
  }
}

function LoginPage({ onLogin }: { onLogin: (token: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Ingresa tu email y contrasena.')
      return
    }

    try {
      setIsLoading(true)
      const data = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })

      localStorage.setItem('accessToken', data.access_token)
      onLogin(data.access_token)
    } catch {
      setError('No se pudo iniciar sesion. Revisa tus datos o intenta mas tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-copy">
        <p className="eyebrow">Frontend_citas</p>
        <h1>Sistema de citas</h1>
        <p className="lead">
          Ingresa para gestionar tus citas, horarios y datos de usuario.
        </p>
      </section>

      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-header">
          <p className="eyebrow">Acceso</p>
          <h2 id="login-title">Iniciar sesion</h2>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="correo@ejemplo.com"
          />

          <label htmlFor="password">Contrasena</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tu contrasena"
          />

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Ingresando...' : 'Iniciar sesion'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
