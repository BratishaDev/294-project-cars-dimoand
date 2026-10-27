<template>
  <v-app>
    <app-header />
    <v-main>
      <router-view />
    </v-main>
    <app-footer />
  </v-app>
</template>

<script setup>
  import AppFooter from '@/components/AppFooter.vue'
  import AppHeader from '@/components/AppHeader.vue'
  import { useCarsStore } from '@/stores/carStore'
  onMounted(async () => {
    const carsStore = useCarsStore()
    await carsStore.init()
  })
</script>
