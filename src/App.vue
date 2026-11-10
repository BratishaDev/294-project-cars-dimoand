<template>
  <v-app>
    <app-header />
    <!-- Pas de <v-main> ici : layouts/default.vue en fournit déjà un (sinon deux <main> imbriqués) -->
    <router-view />
    <app-footer />
  </v-app>
</template>

<script setup>
  import AppFooter from '@/components/AppFooter.vue'
  import AppHeader from '@/components/AppHeader.vue'
  import { useCarsStore } from '@/stores/carStore'

  // Chargement unique au démarrage de l'application : les favoris (localStorage) puis les voitures (API).
  // Toutes les pages lisent ensuite le même store, sans refaire de requête.
  onMounted(async () => {
    const carsStore = useCarsStore()
    await carsStore.init()
  })
</script>
