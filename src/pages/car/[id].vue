<script setup>
  import { useCarsStore } from '@/stores/carStore'

  const route = useRoute()
  const carsStore = useCarsStore()

  const slide = ref(1)
  const car = computed(() => {
    return carsStore.getCarById(route.params.id)
  })

  const photos = computed(() => car.value?.url ?? [])

  // Toutes les versions de cette génération, de la moins puissante à la plus puissante
  const variants = computed(() => {
    if (!car.value) return []
    const list = carsStore.getVariantsByGeneration(car.value.generationId)
    return [...list].sort((a, b) => a.powerHp - b.powerHp)
  })

  const fuelLabels = { petrol: 'Essence', diesel: 'Diesel', electric: 'Électrique', hybrid: 'Hybride' }
  const fuelLabel = slug => fuelLabels[slug] ?? slug

  const formatPrice = n => (n != null ? `${n.toLocaleString('fr-CH')} €` : '—')

  const summary = computed(() => {
    const c = car.value
    if (!c) return ''
    return `Cette <strong>${c.displayName}</strong> est de type ${c.bodyTypeEn}, avec un moteur ${fuelLabel(c.fuelSlug)} de ${c.powerHp} ch.`
  })

  const specs = computed(() => {
    const c = car.value
    if (!c) return []
    return [
      { icon: 'mdi-engine', label: 'Puissance', value: c.powerHp, unit: 'ch' },
      { icon: 'mdi-speedometer', label: 'Vitesse max', value: c.topSpeedKmh, unit: 'km/h' },
      { icon: 'mdi-cog-outline', label: 'Couple', value: c.torqueNm, unit: 'Nm' },
      { icon: 'mdi-timer-outline', label: '0–100 km/h', value: c.accel0100S, unit: 's' },
    ].filter(spec => spec.value != null)
  })

  // En cas de passage à une autre version : galerie sur la 2e photo, retour en haut de la page
  watch(() => route.params.id, () => {
    slide.value = 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  const showSnackbar = ref(false)
  const snackbarMessage = ref('')

  function handleToggleFavorite () {
    const wasFavorite = carsStore.isFavorite(car.value)
    carsStore.toggleFavorite(car.value)
    snackbarMessage.value = wasFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris'
    showSnackbar.value = true
  }
</script>

<template>
  <v-snackbar
    v-model="showSnackbar"
    color="primary"
    :timeout="2000"
  >
    {{ snackbarMessage }}
  </v-snackbar>
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
      Voiture non trouvée.
    </v-alert>

    <template v-else>
      <v-row>
        <!-- Galerie -->
        <v-col cols="12" md="7">
          <!-- Option 1 : plusieurs photos, galerie -->
          <v-carousel
            v-if="photos.length > 1"
            v-model="slide"
            crossfade
            height="420"
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
            height="420"
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
        </v-col>

        <!-- Informations -->
        <v-col cols="12" md="5">
          <div class="d-flex align-start justify-space-between ga-4 mb-3">
            <h1 class="text-h4">
              {{ car.displayName }}
            </h1>
            <v-btn
              :class="{ 'favorite-active': carsStore.isFavorite(car) }"
              :color="carsStore.isFavorite(car) ? 'red' : ''"
              :icon="carsStore.isFavorite(car) ? 'mdi-heart' : 'mdi-heart-outline'"
              :title="carsStore.isFavorite(car) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
              variant="text"
              @click="handleToggleFavorite()"
            />
          </div>

          <div class="mb-3">
            <v-chip class="mr-2">{{ fuelLabel(car.fuelSlug) }}</v-chip>
            <v-chip v-if="car.bodyTypeEn">{{ car.bodyTypeEn }}</v-chip>
          </div>

          <p class="text-body-1 mb-4" v-html="summary" />

          <div class="text-h5 mb-4">
            {{ formatPrice(car.priceNewEur) }}
          </div>

          <v-row dense>
            <v-col
              v-for="spec in specs"
              :key="spec.label"
              cols="6"
            >
              <v-card class="pa-3 text-center" variant="tonal">
                <v-icon :icon="spec.icon" />
                <div class="text-h6">{{ spec.value }} {{ spec.unit }}</div>
                <div class="text-caption">{{ spec.label }}</div>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <!-- Versions de la génération -->
      <h2 class="text-h5 mt-8 mb-4">
        Versions de cette génération ({{ variants.length }})
      </h2>

      <v-table hover>
        <thead>
          <tr>
            <th>Version</th>
            <th>Carburant</th>
            <th>Puissance</th>
            <th>0–100 km/h</th>
            <th>Prix à la sortie</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="variant in variants"
            :key="variant.id"
            class="cursor-pointer"
            :class="{ 'font-weight-bold': variant.id === car.id }"
            @click="$router.push(`/car/${variant.id}`)"
          >
            <td>
              <v-icon
                v-if="variant.id === car.id"
                class="mr-1"
                icon="mdi-check"
                size="small"
              />
              {{ variant.displayName }}
            </td>
            <td>{{ fuelLabel(variant.fuelSlug) }}</td>
            <td>{{ variant.powerHp }} ch</td>
            <td>{{ variant.accel0100S }} s</td>
            <td>{{ formatPrice(variant.priceNewEur) }}</td>
            <td>
              <v-icon
                :color="carsStore.isFavorite(variant) ? 'red' : 'grey'"
                :icon="carsStore.isFavorite(variant) ? 'mdi-heart' : 'mdi-heart-outline'"
                size="small"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </template>
  </v-container>
</template>

<style scoped>
  .favorite-active {
    animation: heartbeat 0.6s ease-in-out;
  }
</style>
