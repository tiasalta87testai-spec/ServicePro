import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

type AuthCtx = {
  user: User | null
  session: Session | null
  tenantId: string | null
  loading: boolean
  signIn: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("AuthContext: Inizializzazione...");
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("AuthContext: Sessione iniziale:", session ? "Presente" : "Assente");
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchTenant(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("AuthContext: Evento Auth:", event, session ? "Sessione Presente" : "Sessione Assente");
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchTenant(session.user.id)
      else { setTenantId(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchTenant(userId: string) {
    const { data } = await supabase.from('users').select('tenant_id').eq('id', userId).single()
    setTenantId(data?.tenant_id ?? null)
    setLoading(false)
  }

  async function signIn(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { 
        emailRedirectTo: `http://localhost:5174/calendar` // Forziamo la porta corretta
      }
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setTenantId(null)
  }

  // Funzione per il bypass in sviluppo
  async function devLogin() {
    setLoading(true);
    // Simuliamo un utente tecnico per testare la UI
    const dummyUser = { 
      id: '00000000-0000-0000-0000-000000000000', 
      email: 'matti@esempio.it',
      user_metadata: { full_name: 'Matti (Demo)' }
    } as any;
    
    setUser(dummyUser);
    setSession({ user: dummyUser } as any);
    setTenantId('demo-tenant'); 
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ user, session, tenantId, loading, signIn, signOut, devLogin } as any}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
