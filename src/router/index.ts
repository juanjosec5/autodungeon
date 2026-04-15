import { createRouter, createWebHashHistory } from 'vue-router'
import CharacterCreation from '../components/CharacterCreation.vue'
import GameView from '../views/GameView.vue'
import WikiView from '../views/WikiView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: CharacterCreation },
    { path: '/game', component: GameView },
    { path: '/wiki', component: WikiView },
  ],
})

export default router
