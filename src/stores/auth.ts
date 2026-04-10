import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const isGuest = computed(() => session.value === null)

  // Hydrate on init
  supabase.auth.getSession().then(({ data }) => {
    session.value = data.session
  })

  // Keep in sync with Supabase auth state changes
  supabase.auth.onAuthStateChange((_event, newSession) => {
    session.value = newSession
  })

  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return { session, isGuest, signUp, signIn, signOut }
})
