<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Cars
    </h1>

    <!-- Recherche, filtre et tri -->
    <v-row align="center" class="mb-2">
      <v-col cols="12" lg="5" md="4">
        <v-text-field
          v-model="carsStore.search"
          clearable
          hide-details
          label="Rechercher une voiture"
          prepend-inner-icon="mdi-magnify"
        />
      </v-col>
      <v-col cols="12" md="3" sm="6">
        <v-select
          v-model="carsStore.bodyType"
          clearable
          hide-details
          :items="bodyTypes"
          label="Carrosserie"
        />
      </v-col>
      <v-col cols="12" md="2" sm="6">
        <v-select
          v-model="carsStore.sortBy"
          hide-details
          :items="sortItems"
          label="Trier par"
        />
      </v-col>
      <v-col cols="12" lg="2" md="3">
        <v-btn
          block
          :disabled="!hasActiveFilters"
          height="56"
          prepend-icon="mdi-filter-remove"
          variant="tonal"
          @click="carsStore.resetFilters()"
        >
          Réinitialiser
        </v-btn>
      </v-col>
    </v-row>

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

    <!-- Message d'erreur -->
    <v-alert
      v-else-if="carsStore.error"
      class="mb-6"
      type="error"
      variant="tonal"
    >
      Impossible de charger les Voitures. Vérifiez que l'API tourne sur
      {{ apiUrl }}.
    </v-alert>

    <!-- Aucun résultat pour la recherche -->
    <v-alert
      v-else-if="generations.length === 0"
      class="mb-6"
      type="info"
      variant="tonal"
    >
      Aucune voiture ne correspond à votre recherche.
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
        <car-card :car="generation.main" :count="generation.count" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>

  import { storeToRefs } from 'pinia'
  import CarCard from '@/components/CarCard.vue'
  import { useCarsStore } from '@/stores/carStore'

  const carsStore = useCarsStore()
  const { generations, bodyTypes, hasActiveFilters } = storeToRefs(carsStore)

  const sortItems = [
    { title: 'Par défaut', value: 'default' },
    { title: 'Nom A → Z', value: 'name-asc' },
    { title: 'Nom Z → A', value: 'name-desc' },
  ]

  // URL de l'API pour le message d'erreur
  const apiUrl = import.meta.env.VITE_API_URL || 'https://apis.divtec.me/api/cars'
</script>
