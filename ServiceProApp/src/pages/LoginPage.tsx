import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const { user, loading, signIn, devLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)

  if (loading) return <div className="h-full flex items-center justify-center"><Spinner /></div>
  if (user) return <Navigate to="/calendar" replace />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSending(true)
    setError('')
    const result = await signIn(email)
    setSending(false)
    if (result.error) setError(result.error)
    else setSent(true)
  }

  return (
    <div className="h-full flex flex-col items-center justify-center px-6 safe-top safe-bottom bg-gradient-to-br from-[#0F172A] via-[#0F172A] to-[#134E4A]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4 rounded-[22px] bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center shadow-lg shadow-teal-500/20">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">ServiceProApp</h1>
          <p className="text-[var(--color-text-secondary)] text-sm mt-1">Gestione eventi & attrezzature</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 text-center"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-teal-500/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-teal-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-1">Controlla la tua email</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Abbiamo inviato un link magico a <strong className="text-[var(--color-text-primary)]">{email}</strong>
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="glass p-6 space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-[var(--color-text-secondary)] mb-1.5 block">Email aziendale</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="nome@azienda.it"
                  autoComplete="email"
                  required
                  className="w-full h-12 px-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                />
              </label>
              {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}
              <button
                type="submit"
                disabled={sending || !email}
                className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <Spinner small /> : null}
                {sending ? 'Invio in corso...' : 'Invia Magic Link'}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--color-border)]"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0F172A] px-2 text-[var(--color-text-muted)]">Sviluppo</span></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  devLogin();
                }}
                className="w-full py-3 rounded-xl border border-teal-500/30 text-teal-400 text-sm font-medium active:scale-[0.98] transition-transform"
              >
                Accedi come Demo (Solo Test UI)
              </button>
              
              <p className="text-[10px] text-center text-[var(--color-text-muted)] mt-4">
                Origin: {window.location.origin}
              </p>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}

function Spinner({ small }: { small?: boolean }) {
  return (
    <svg className={`animate-spin ${small ? 'w-5 h-5' : 'w-8 h-8'} text-teal-400`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
