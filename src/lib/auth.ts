import { createClientComponentClient } from './supabase'
import { User } from '@supabase/supabase-js'

export class SupabaseAuth {
  private static getClient() {
    return createClientComponentClient()
  }

  // Sign up with email and password
  static async signUp(email: string, password: string) {
    const supabase = this.getClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  // Sign in with email and password
  static async signIn(email: string, password: string) {
    const supabase = this.getClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // Sign in with OAuth providers
  static async signInWithProvider(provider: 'google' | 'github') {
    const supabase = this.getClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  // Sign out
  static async signOut() {
    const supabase = this.getClient()
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const supabase = this.getClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Listen to auth changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    const supabase = this.getClient()
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}