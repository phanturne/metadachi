"use client"

import { createClient } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useState } from "react"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
  signInAnonymously: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const supabase = createClient()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session:", session?.user?.id || "No user")
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth event:", event, "User:", session?.user?.id || "No user")
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signInAnonymously = async () => {
    try {
      console.log("Attempting anonymous sign in...")
      const { data, error } = await supabase.auth.signInAnonymously()
      if (error) {
        console.error("Anonymous sign in error:", error)
        throw error
      }
      console.log("Anonymous sign in successful:", data?.user?.id)
      // Listener should handle state update, no need for manual update
    } catch (error) {
      console.error("Error signing in anonymously:", error)
      throw error
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const value = {
    user,
    isLoading,
    signOut,
    signInAnonymously,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}