<script setup>
  import { useCarsStore } from '@/stores/carStore'

  const route = useRoute()
  const router = useRouter()
  const carsStore = useCarsStore()

  // Index du slide affiché. On démarre sur la 2e photo (index 1), comme sur la carte du catalogue
  const slide = ref(1)

  // La version affichée, retrouvée grâce à l'ID de l'URL (/car/:id).
  // Se recalcule toute seule si l'URL change. Vaut undefined tant que les voitures
  // ne sont pas chargées, ou si l'ID n'existe pas.
  const car = computed(() => {
    return carsStore.getCarById(route.params.id)
  })

  // ?? [] : évite une erreur quand la voiture n'est pas encore disponible
  const photos = computed(() => car.value?.url ?? [])

  // Toutes les versions de cette génération, de la moins puissante à la plus puissante
  const variants = computed(() => {
    if (!car.value) return []
    const list = carsStore.getVariantsByGeneration(car.value.generationId)
    // [...list] : copie, pour trier sans modifier le tableau du store
    return [...list].sort((a, b) => a.powerHp - b.powerHp)
  })

  const fuelLabels = { petrol: 'Essence', diesel: 'Diesel', electric: 'Électrique', hybrid: 'Hybride' }
  // ?? slug : si le carburant n'est pas dans la liste, on affiche le texte brut de l'API
  const fuelLabel = slug => fuelLabels[slug] ?? slug

  const formatPrice = n => (n != null ? `${n.toLocaleString('fr-CH')} €` : '—')

  // Valeur + unité, ou « — » quand l'API ne fournit pas la donnée
  // (certaines versions n'ont pas de temps 0–100 km/h : sans ça on verrait « undefined s »)
  const formatValue = (value, unit) => (value != null ? `${value} ${unit}` : '—')

  // Tuiles de caractéristiques ; .filter() retire celles que l'API ne donne pas pour cette voiture
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

  // Passer d'une version à une autre garde le MÊME composant (seul l'ID change, rien n'est recréé).
  // On remet donc la galerie sur la 2e photo et on remonte en haut de la page « à la main ».
  watch(() => route.params.id, () => {
    slide.value = 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  // Bouton « Retour » : router.back() ne marche que s'il existe une page précédente DANS l'application.
  // Si on arrive directement (lien, nouvel onglet), history.state.back vaut null → on va au catalogue.
  function goBack () {
    if (window.history.state?.back) {
      router.back()
    } else {
      router.push('/')
    }
  }

  // Une ligne du tableau ouvre la version correspondante (souris ET clavier)
  function openVariant (id) {
    router.push(`/car/${id}`)
  }

  const showSnackbar = ref(false)
  const snackbarMessage = ref('')

  function handleToggleFavorite () {
    // On lit l'état AVANT le changement, pour afficher le bon message
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
      @click="goBack()"
    >
      Retour
    </v-btn>

    <!--
      Un seul de ces blocs s'affiche, dans cet ordre de priorité :
      chargement → erreur API → ID inconnu → contenu.
      Sans le 1er, un rafraîchissement de la page afficherait « Voiture non trouvée »
      pendant que les voitures se chargent encore.
    -->
    <v-skeleton-loader
      v-if="carsStore.isLoading"
      type="image, article"
    />

    <v-alert
      v-else-if="carsStore.error"
      type="error"
      variant="tonal"
    >
      Impossible de charger les voitures. Réessayez plus tard.
    </v-alert>

    <v-alert
      v-else-if="!car"
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
              :aria-label="carsStore.isFavorite(car) ? 'Retirer des favoris' : 'Ajouter aux favoris'"
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

          <p class="text-body-1 mb-4">
            Cette <strong>{{ car.displayName }}</strong> est de type {{ car.bodyTypeEn }},
            avec un moteur {{ fuelLabel(car.fuelSlug) }} de {{ car.powerHp }} ch.
          </p>

          <div class="text-h5 text-primary mb-4">
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
            <th>Favori</th>
          </tr>
        </thead>
        <tbody>
          <!--
            Ligne cliquable ET accessible au clavier (tabindex + touche Entrée).
            La version affichée en ce moment est en gras et marquée d'une coche.
          -->
          <tr
            v-for="variant in variants"
            :key="variant.id"
            class="cursor-pointer"
            :class="{ 'font-weight-bold': variant.id === car.id }"
            tabindex="0"
            @click="openVariant(variant.id)"
            @keydown.enter="openVariant(variant.id)"
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
            <td>{{ formatValue(variant.powerHp, 'ch') }}</td>
            <td>{{ formatValue(variant.accel0100S, 's') }}</td>
            <td>{{ formatPrice(variant.priceNewEur) }}</td>
            <td>
              <v-icon
                :color="carsStore.isFavorite(variant) ? 'red' : 'grey-darken-1'"
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
