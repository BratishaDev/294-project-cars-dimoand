import { defineStore } from 'pinia'
import { fetchVariants } from '@/services/api'

export const useCarsStore = defineStore('cars', {
  state: () => ({
    // Toutes les versions (variants) reçues de l'API, à plat
    cars: [],
    isLoading: false,
    error: null,
    // Recherche et filtres
    search: '',
    bodyType: null,
    sortBy: 'name-asc',
    // ★ Favoris : tableau d'ID de versions (car.id)
    favorites: [],
  }),

  getters: {
    totalCars: (state) => state.cars.length,

    // Types de carrosserie disponibles (pour le menu déroulant)
    // Set supprime les doublons, filter(Boolean) ignore les valeurs vides
    bodyTypes: (state) => {
      const types = state.cars.map(car => car.bodyTypeEn).filter(Boolean)
      return [...new Set(types)].sort()
    },

    // Y a-t-il au moins un filtre actif ? (pour le bouton de réinitialisation)
    hasActiveFilters: (state) => {
      return Boolean(state.search) || Boolean(state.bodyType) || state.sortBy !== 'name-asc'
    },

    // Versions qui passent la recherche et les filtres, puis triées
    filteredCars: (state) => {
      // ?? '' : le champ « clearable » remet search à null quand on clique sur la croix
      const query = (state.search ?? '').trim().toLowerCase()

      const list = state.cars.filter(car => {
        const matchesSearch = !query || (car.displayName ?? '').toLowerCase().includes(query)
        const matchesBody = !state.bodyType || car.bodyTypeEn === state.bodyType
        return matchesSearch && matchesBody
      })

      // filter() a créé un nouveau tableau, on peut donc le trier sans toucher à state.cars
      // direction : 1 = ordre A → Z, -1 = ordre inversé Z → A
      const direction = state.sortBy === 'name-desc' ? -1 : 1
      list.sort((a, b) => direction * (a.displayName ?? '').localeCompare(b.displayName ?? ''))

      return list
    },

    // Liste des générations, construite à partir des versions filtrées.
    // Plusieurs versions ont le même generationId → elles forment UNE seule carte dans le catalogue.
    // ⚠ Fonction normale (pas une flèche) : on a besoin de `this` pour lire un autre getter (this.filteredCars)
    generations () {
      // Map : generationId → tableau de ses versions (garde l'ordre d'insertion, donc l'ordre du tri)
      const groups = new Map()

      for (const car of this.filteredCars) {
        if (!groups.has(car.generationId)) {
          groups.set(car.generationId, [])
        }
        groups.get(car.generationId).push(car)
      }

      // Map → tableau d'objets ; `main` = 1re version du groupe, c'est elle qui s'affiche sur la carte
      return Array.from(groups, ([generationId, variants]) => ({
        generationId,
        variants,
        main: variants[0],
        count: variants.length,
      }))
    },

    // Toutes les versions d'une même génération (pour la page de détails)
    // Number() : l'ID reçu peut être un texte (venant de l'URL) alors que generationId est un nombre ;
    // sans conversion, "12" === 12 serait toujours faux
    getVariantsByGeneration: (state) => (generationId) => {
      const id = Number(generationId)
      return state.cars.filter(car => car.generationId === id)
    },

    // Une version spécifique par ID (même conversion : l'ID de l'URL /car/:id est un texte)
    getCarById: (state) => (carId) => {
      const id = Number(carId)
      return state.cars.find(car => car.id === id)
    },

    // Nombre de favoris
    totalFavorites: (state) => state.favorites.length,

    // Cette version précise est-elle en favoris ?
    isFavorite: (state) => (car) => {
      return state.favorites.includes(car.id)
    },

    // Au moins une version de cette génération est-elle en favoris ?
    // (sert au cœur « contour rouge » : une AUTRE version de la génération est en favoris)
    hasFavoriteInGeneration: (state) => (generationId) => {
      const id = Number(generationId)
      return state.cars.some(car => {
        return car.generationId === id && state.favorites.includes(car.id)
      })
    },

    // Objets voiture des favoris (pas seulement les ID)
    getFavorites: (state) => {
      // find() renvoie undefined si l'ID n'existe plus dans l'API → filter() retire ces trous
      const favoriteCars = state.favorites.map(favoriteId => {
        return state.cars.find(car => car.id === favoriteId)
      })
      return favoriteCars.filter(car => car !== undefined)
    },
  },

  actions: {
    // withLoader = false permet de recharger les données sans réafficher les squelettes
    async fetchCars ({ withLoader = true } = {}) {
      if (withLoader) this.isLoading = true

      try {
        // La requête HTTP est dans services/api.js ; en cas d'échec elle lève une erreur → catch ci-dessous
        this.cars = await fetchVariants()
        // Les voitures sont arrivées : on peut vérifier que les favoris existent encore
        this.cleanupFavorites()
      } catch (error) {
        console.error('Erreur:', error.message)
        this.error = 'Erreur lors du chargement des voitures'
        this.cars = []
      } finally {
        if (withLoader) this.isLoading = false
      }
    },

    // Appelée une seule fois au démarrage (App.vue)
    async init () {
      this.isLoading = true
      this.error = null
      // Les favoris sont lus AVANT le chargement des voitures :
      // cleanupFavorites() (dans fetchCars) en a besoin pour les comparer aux voitures reçues
      this.loadFavorites()
      try {
        await this.fetchCars()
      } catch (error) {
        this.error = 'Erreur lors du chargement des voitures'
        console.error(error)
      } finally {
        this.isLoading = false
      }
    },

    // Remet la recherche, le filtre et le tri à zéro
    resetFilters () {
      this.search = ''
      this.bodyType = null
      this.sortBy = 'name-asc'
    },

    // Charge les favoris depuis localStorage
    // try/catch : JSON.parse plante si le texte stocké n'est pas du JSON valide
    loadFavorites () {
      try {
        const saved = localStorage.getItem('car_favorites')
        const parsed = saved ? JSON.parse(saved) : []
        // Array.isArray : on ignore tout ce qui n'est pas un tableau (valeur modifiée à la main, ancien format…)
        this.favorites = Array.isArray(parsed) ? parsed : []
        console.log('Favoris chargés :', this.favorites.length, 'éléments')
      } catch (error) {
        console.error('Erreur lors du chargement des favoris :', error)
        this.favorites = []
      }
    },

    // Sauvegarde les favoris dans localStorage
    // try/catch : localStorage peut être indisponible (navigation privée, stockage plein)
    saveFavorites () {
      try {
        localStorage.setItem('car_favorites', JSON.stringify(this.favorites))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des favoris :', error)
      }
    },

    // Ajoute ou retire une version des favoris
    toggleFavorite (car) {
      // findIndex renvoie -1 quand l'ID n'est pas encore dans les favoris
      const favoriteIndex = this.favorites.findIndex(
        favoriteId => favoriteId === car.id,
      )

      if (favoriteIndex === -1) {
        this.favorites.push(car.id)
      } else {
        this.favorites.splice(favoriteIndex, 1)
      }

      this.saveFavorites()
    },

    // Supprime les favoris dont la voiture n'existe plus dans l'API
    cleanupFavorites () {
      // Liste vide = l'API n'a rien renvoyé (panne, erreur réseau). On ne touche à rien :
      // sinon tous les favoris seraient jugés « obsolètes » et effacés à cause d'un simple problème réseau
      if (this.cars.length === 0) return

      const initialCount = this.favorites.length

      this.favorites = this.favorites.filter(favoriteId => {
        return this.cars.some(car => car.id === favoriteId)
      })

      const removedCount = initialCount - this.favorites.length
      if (removedCount > 0) {
        console.log('Nettoyage :', removedCount, 'favoris obsolètes supprimés')
        this.saveFavorites()
      }
    },
  },
})
