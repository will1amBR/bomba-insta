import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  signUp: (email: string, password: string, role?: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signInWith: (provider: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(pb.authStore.isValid ? pb.authStore.record : null)
  const [isAuthenticated, setIsAuthenticated] = useState(pb.authStore.isValid)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange((_token, record) => {
      setUser(pb.authStore.isValid ? record : null)
      setIsAuthenticated(pb.authStore.isValid)
    })

    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.authStore.clear())
        .finally(() => setLoading(false))
    } else {
      if (pb.authStore.record) pb.authStore.clear()
      setLoading(false)
    }
    return () => {
      unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, role?: string) => {
    try {
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name: role === 'agency' ? 'Agência' : 'Criador de Conteúdo',
        role: role || 'creator',
      })
      await pb.collection('users').authWithPassword(email, password)

      const leadToken = localStorage.getItem('lead_token')
      if (leadToken) {
        try {
          await pb.send('/backend/v1/leads/link', {
            method: 'POST',
            body: JSON.stringify({ lead_token: leadToken }),
            headers: { 'Content-Type': 'application/json' },
          })
        } catch {
          /* intentionally ignored */
        }
        localStorage.removeItem('lead_token')
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await pb.collection('users').authWithPassword(email, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signInWith = async (provider: string) => {
    try {
      await pb.collection('users').authWithOAuth2({ provider })

      const leadToken = localStorage.getItem('lead_token')
      if (leadToken) {
        try {
          await pb.send('/backend/v1/leads/link', {
            method: 'POST',
            body: JSON.stringify({ lead_token: leadToken }),
            headers: { 'Content-Type': 'application/json' },
          })
        } catch {
          /* intentionally ignored */
        }
        localStorage.removeItem('lead_token')
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, signUp, signIn, signInWith, signOut, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
