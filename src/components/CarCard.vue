<script setup>
  import { useCarsStore } from '@/stores/carStore'

  const props = defineProps({
    car: {
      type: Object,
      required: true,
    },
    // Nombre de versions : affiché seulement s'il est fourni (catalogue, pas favoris)
    count: {
      type: Number,
      default: null,
    },
  })

  const carsStore = useCarsStore()

  const showSnackbar = ref(false)
  const snackbarMessage = ref('')

  // Les trois états du cœur
  const heartStates = {
    version: { icon: 'mdi-heart', color: 'red', tip: 'Cette version est en favoris' },
    generation: { icon: 'mdi-heart-outline', color: 'red', tip: 'Une autre version de cette génération est en favoris' },
    none: { icon: 'mdi-heart', color: 'grey', tip: 'Ajouter cette version aux favoris' },
  }

  const heart = computed(() => {
    if (carsStore.isFavorite(props.car)) return heartStates.version
    if (carsStore.hasFavoriteInGeneration(props.car.generationId)) return heartStates.generation
    return heartStates.none
  })

  function handleToggleFavorite () {
    const wasFavorite = carsStore.isFavorite(props.car)
    carsStore.toggleFavorite(props.car)
    snackbarMessage.value = wasFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris'
    showSnackbar.value = true
  }
</script>

<template>
  <v-card
    hover
    :to="`/car/${car.id}`"
  >
    <v-img
      :alt="car.displayName"
      cover
      height="230"
      :src="car.url?.[1] || car.url?.[0] || '/images/sports_car_placeholder.png'"
    />

    <v-card-title class="text-wrap">
      {{ car.displayName }}
    </v-card-title>

    <v-card-text>
      <v-chip v-if="car.fuelSlug" class="mr-2" size="small">
        {{ car.fuelSlug }}
      </v-chip>
      <v-chip v-if="car.bodyTypeEn" size="small">
        {{ car.bodyTypeEn }}
      </v-chip>
    </v-card-text>

    <v-card-actions>
      <span
        v-if="count !== null"
        class="text-body-2 text-medium-emphasis ml-2"
      >
        {{ count }} {{ count > 1 ? 'versions' : 'version' }}
      </span>
      <v-spacer />
      <v-btn
        :aria-label="heart.tip"
        :class="{ 'favorite-active': carsStore.isFavorite(car) }"
        :color="heart.color"
        :icon="heart.icon"
        :title="heart.tip"
        variant="text"
        @click.stop.prevent="handleToggleFavorite()"
      />
    </v-card-actions>

    <v-snackbar
      v-model="showSnackbar"
      color="primary"
      :timeout="2000"
    >
      {{ snackbarMessage }}
    </v-snackbar>
  </v-card>
</template>

<style scoped>
.favorite-active {
  animation: heartbeat 0.6s ease-in-out;
}
</style>
