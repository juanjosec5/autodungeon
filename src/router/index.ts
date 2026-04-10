import { createRouter, createWebHashHistory } from 'vue-router'
import CharacterCreation from '../components/CharacterCreation.vue'
import GameView from '../views/GameView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: CharacterCreation },
    { path: '/game', component: GameView },
  ],
})

export default router
