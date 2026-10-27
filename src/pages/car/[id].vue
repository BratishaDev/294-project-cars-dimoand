<script setup>
  import { useCarsStore } from '@/stores/carStore'

  const route = useRoute()

  const carsStore = useCarsStore()
  const car = computed(() => {
    return carsStore.getCarById(route.params.id)
  })
</script>

<template>
  <v-container>
    <v-btn
      class="mb-4"
      prepend-icon="mdi-arrow-left"
      variant="text"
      @click="$router.back()"
    >
      Retour
    </v-btn>

    <v-alert
      v-if="!car"
      type="error"
      variant="tonal"
    >
      Voiture non trouvé.
    </v-alert>

    <v-card
      v-else
      class="mx-auto"
      max-width="800"
    >
      <v-img
        :alt="car.displayName"
        cover
        height="400"
        :src="car.url?.[1] || car.url?.[0] || '/images/sports_car_placeholder.png'"
      />

      <v-card-title class="text-h4">
        {{ car.displayName }}
      </v-card-title>

      <v-card-subtitle>
        Power {{ car.powerHp }} HP
      </v-card-subtitle>

      <v-card-text>
        <p v-if="car.bodyTypeEn" class="text-body-1 mb-4">
          {{ car.bodyTypeEn }}
        </p>
      </v-card-text>
    </v-card>
  </v-container>
</template>
