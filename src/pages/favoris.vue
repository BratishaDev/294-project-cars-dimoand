<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Mes favoris ({{ carsStore.totalFavorites }})
    </h1>

    <v-progress-linear
      v-if="carsStore.isLoading"
      class="mb-6"
      indeterminate
    />

    <!-- Si l'API est en panne, les favoris (des ID) sont gardés mais on ne peut pas afficher les voitures -->
    <v-alert
      v-else-if="carsStore.error"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les voitures. Vos favoris sont conservés, réessayez plus tard.
    </v-alert>

    <v-alert
      v-else-if="carsStore.totalFavorites === 0"
      class="mb-6"
      type="info"
      variant="tonal"
    >
      Vous n'avez pas encore de voitures favorites.
      Cliquez sur le cœur d'une voiture pour l'ajouter !
    </v-alert>

    <!-- getFavorites : objets voiture complets (le store ne garde que les ID dans localStorage) -->
    <v-row v-else>
      <v-col
        v-for="car in carsStore.getFavorites"
        :key="car.id"
        cols="12"
        lg="4"
        md="6"
        sm="6"
      >
        <car-card :car="car" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import CarCard from '@/components/CarCard.vue'
  import { useCarsStore } from '@/stores/carStore'

  const carsStore = useCarsStore()
</script>
