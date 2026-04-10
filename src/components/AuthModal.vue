<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useSaveStore } from '../stores/save'
import { useRouter } from 'vue-router'

const emit = defineEmits<{ close: [] }>()

const authStore = useAuthStore()
const saveStore = useSaveStore()
const router = useRouter()

const mode = ref<'signin' | 'signup'>('signin')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    if (mode.value === 'signin') {
      await authStore.signIn(email.value, password.value)
    } else {
      await authStore.signUp(email.value, password.value)
    }
    // After auth, try to load a cloud save
    const found = await saveStore.loadCharacter()
    if (found) {
      router.push('/game')
    } else {
      emit('close')
    }
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Authentication failed'
  } finally {
    loading.value = false
  }
}

function playAsGuest() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70" @click.self="emit('close')">
    <div class="bg-gray-900 border border-gray-700 rounded-2xl p-8 w-full max-w-sm mx-4 shadow-2xl">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-bold text-gray-100">
          {{ mode === 'signin' ? 'Sign in' : 'Create account' }}
        </h2>
        <button @click="emit('close')" class="text-gray-600 hover:text-gray-400 transition-colors text-xl leading-none">✕</button>
      </div>

      <!-- Form -->
      <form @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Email</label>
          <input
            v-model="email"
            type="email"
            required
            autocomplete="email"
            placeholder="you@example.com"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          />
        </div>
        <div>
          <label class="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            placeholder="••••••••"
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-amber-500 transition-colors text-sm"
          />
        </div>

        <!-- Error -->
        <p v-if="error" class="text-red-400 text-xs">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2.5 rounded-lg font-bold text-sm bg-amber-500 hover:bg-amber-400 text-gray-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Create account' }}
        </button>
      </form>

      <!-- Toggle mode -->
      <p class="text-center text-xs text-gray-500 mt-4">
        {{ mode === 'signin' ? "Don't have an account?" : 'Already have an account?' }}
        <button
          @click="mode = mode === 'signin' ? 'signup' : 'signin'"
          class="text-amber-400 hover:text-amber-300 font-semibold ml-1"
        >
          {{ mode === 'signin' ? 'Sign up' : 'Sign in' }}
        </button>
      </p>

      <!-- Divider -->
      <div class="flex items-center gap-3 my-4">
        <div class="flex-1 h-px bg-gray-800" />
        <span class="text-gray-600 text-xs">or</span>
        <div class="flex-1 h-px bg-gray-800" />
      </div>

      <!-- Guest -->
      <button
        @click="playAsGuest"
        class="w-full py-2.5 rounded-lg text-sm font-semibold text-gray-400 border border-gray-700 hover:border-gray-600 hover:text-gray-200 transition-colors"
      >
        Play as guest
      </button>
      <p class="text-center text-xs text-gray-600 mt-2">Progress saved to this browser only</p>
    </div>
  </div>
</template>
