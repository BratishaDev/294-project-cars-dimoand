<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Cars
    </h1>
    <!-- Squelettes de chargement pendant la requête API -->
    <v-row v-if="carsStore.isLoading">
      <v-col
        v-for="n in 8"
        :key="n"
        cols="12"
        lg="4"
        md="6"
        sm="6"
      >
        <v-skeleton-loader
          height="350"
          type="image, article"
        />
      </v-col>
    </v-row>
    <!-- Message d'erreur si aucun voiture chargé -->
    <v-alert
      v-else-if="carsStore.error"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les Voitures. Vérifiez que l'API tourne sur
      {{ apiUrl }}.
    </v-alert>

    <!-- Grille de cartes (cas normal) -->
    <v-row v-else>
      <v-col
        v-for="generation in generations"
        :key="generation.generationId"
        cols="12"
        lg="4"
        md="6"
        sm="6"
      >
        <car-card :car="generation.main" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>

  import { storeToRefs } from 'pinia'
  import CarCard from '@/components/CarCard.vue'
  import { useCarsStore } from '@/stores/carStore'

  const carsStore = useCarsStore()
  const { generations } = storeToRefs(carsStore)

  // URL de l'API pour le message d'erreur
  const apiUrl = import.meta.env.VITE_API_URL || 'https://apis.divtec.me/api/cars'
</script>
