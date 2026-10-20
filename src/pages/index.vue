<template>
  <v-container>
    <h1 class="text-h3 text-center my-6">
      Cars
    </h1>
    <v-row>
      <v-col
        v-for="car in cars"
        :key="car.id"
        cols="12"
        lg="4"
        md="4"
        sm="6"
      >
        <car-card :car="car" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import axios from 'axios'
  import { onMounted, ref } from 'vue'
  import CarCard from '@/components/CarCard.vue'

  const cars = ref([])

  async function chargerCars () {
    try {
      const response = await axios.get('https://apis.divtec.me/api/cars/variants?limit=50')
      cars.value = response.data.data
      console.log('Voitures chargés :', response.data.data)
    } catch (error) {
      // En cas d’erreur, on affiche le message d’erreur
      console.error('Erreur lors de la récupération des voitures:', error)
    }
  }

  onMounted(() => {
    chargerCars()
  })
</script>
