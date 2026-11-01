<script setup>
  import { useCarsStore } from '@/stores/carStore'

  const route = useRoute()

  const carsStore = useCarsStore()
  const car = computed(() => {
    return carsStore.getCarById(route.params.id)
  })

  const photos = computed(() => car.value?.url ?? [])
  const slide = ref(1)
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
      <!-- Option 1 : plusieurs photos, galerie -->
      <v-carousel
        v-if="photos.length > 1"
        v-model="slide"
        crossfade
        height="500"
        hide-delimiters
        show-arrows="hover"
        slower
      >
        <v-carousel-item
          v-for="(photo, index) in photos"
          :key="index"
          :alt="`${car.displayName} - photo ${index + 1}`"
          cover
          :src="photo"
        />
      </v-carousel>

      <!-- Option 2 : une seule photo -->
      <v-img
        v-else-if="photos.length === 1"
        :alt="car.displayName"
        cover
        height="500"
        :src="photos[0]"
      />

      <!-- Option 3 : aucune photo -->
      <v-img
        v-else
        alt="Pas de photo"
        cover
        height="450"
        src="/images/sports_car_placeholder.png"
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
