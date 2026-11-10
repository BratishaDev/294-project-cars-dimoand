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

  // Les trois états du cœur (icône, couleur, texte d'aide)
  // grey-darken-1 : un gris assez foncé pour rester lisible (contraste) sur fond clair
  const heartStates = {
    version: { icon: 'mdi-heart', color: 'red', tip: 'Cette version est en favoris' },
    generation: { icon: 'mdi-heart-outline', color: 'red', tip: 'Une autre version de cette génération est en favoris' },
    none: { icon: 'mdi-heart', color: 'grey-darken-1', tip: 'Ajouter cette version aux favoris' },
  }

  // Choisit l'état du cœur. L'ordre des if compte :
  // « cette version est en favoris » l'emporte sur « une autre version de la génération l'est »
  const heart = computed(() => {
    if (carsStore.isFavorite(props.car)) return heartStates.version
    if (carsStore.hasFavoriteInGeneration(props.car.generationId)) return heartStates.generation
    return heartStates.none
  })

  function handleToggleFavorite () {
    // On lit l'état AVANT le changement, pour afficher le bon message
    const wasFavorite = carsStore.isFavorite(props.car)
    carsStore.toggleFavorite(props.car)
    snackbarMessage.value = wasFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris'
    showSnackbar.value = true
  }
</script>

<template>
  <!-- Toute la carte est un lien vers la page de cette version -->
  <v-card
    hover
    :to="`/car/${car.id}`"
  >
    <!--
      Photo : la 2e (url[1]) en priorité, sinon la 1re (url[0]), sinon l'image par défaut.
      Le ?. évite une erreur quand la voiture n'a pas de champ url.
    -->
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
      <v-chip v-if="car.fuelSlug" class="mr-2" color="primary" size="small" variant="tonal">
        {{ car.fuelSlug }}
      </v-chip>
      <v-chip v-if="car.bodyTypeEn" color="primary" size="small" variant="tonal">
        {{ car.bodyTypeEn }}
      </v-chip>
    </v-card-text>

    <v-card-actions>
      <!-- Nombre de versions : seulement dans le catalogue (count est null dans les favoris) -->
      <span
        v-if="count !== null"
        class="text-body-2 text-medium-emphasis ml-2"
      >
        {{ count }} {{ count > 1 ? 'versions' : 'version' }}
      </span>
      <v-spacer />
      <!--
        Cœur : la carte entière est un lien, donc il faut empêcher le clic de l'activer.
        .stop → le clic ne « remonte » pas jusqu'à la carte ; .prevent → bloque la navigation du lien.
        La classe favorite-active (animation « battement ») n'est posée que si CETTE version est en favoris.
      -->
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
