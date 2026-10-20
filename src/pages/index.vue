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
        lg="3"
        md="4"
        sm="6"
      >
        <v-card
          hover
        >
          <v-img
            :alt="car.displayName"
            cover
            height="200"
            :src="car.url[1] ?? car.url[0]"
          />
          <v-card-title>{{ car.displayName }}</v-card-title>
          <v-card-subtitle>Power {{ car.powerHp }} HP</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import axios from 'axios'
  import { onMounted, ref } from 'vue'

  const cars = ref([])

  async function chargerCars () {
    try {
      const response = await axios.get('https://apis.divtec.me/api/cars/variants?limit=50')
      cars.value = response.data.data
      console.log('Voitures chargés :', response.data)
    } catch (error) {
      // En cas d’erreur, on affiche le message d’erreur
      console.error('Erreur lors de la récupération des voitures:', error)
    }
  }

  onMounted(() => {
    chargerCars()
  })
</script>
