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
  // Importation du composant AppHeader pour l'en-tête de l'application
  import AppHeader from '@/components/AppHeader.vue'
</script>
