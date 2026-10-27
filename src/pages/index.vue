<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Cars
    </h1>
    <v-row>
      <v-col
        v-for="generation in generations"
        :key="generation.generationId"
        cols="12"
        lg="4"
        md="4"
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
</script>
