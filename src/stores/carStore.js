import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useCarsStore = defineStore('cars', {
  state: () => ({
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
      const query = (state.search ?? '').trim().toLowerCase()

      const list = state.cars.filter(car => {
        const matchesSearch = !query || (car.displayName ?? '').toLowerCase().includes(query)
        const matchesBody = !state.bodyType || car.bodyTypeEn === state.bodyType
        return matchesSearch && matchesBody
      })

      // filter() a créé un nouveau tableau, on peut donc le trier sans toucher à state.cars
      const direction = state.sortBy === 'name-desc' ? -1 : 1
      list.sort((a, b) => direction * (a.displayName ?? '').localeCompare(b.displayName ?? ''))

      return list
    },

    // Liste des générations, construite à partir des versions filtrées
    generations () {
      const groups = new Map()

      for (const car of this.filteredCars) {
        if (!groups.has(car.generationId)) {
          groups.set(car.generationId, [])
        }
        groups.get(car.generationId).push(car)
      }

      return Array.from(groups, ([generationId, variants]) => ({
        generationId,
        variants,
        main: variants[0],
        count: variants.length,
      }))
    },

    // Toutes les versions d'une même génération (pour la page de détails)
    getVariantsByGeneration: (state) => (generationId) => {
      const id = Number(generationId)
      return state.cars.filter(car => car.generationId === id)
    },

    // Une version spécifique par ID
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
    hasFavoriteInGeneration: (state) => (generationId) => {
      const id = Number(generationId)
      return state.cars.some(car => {
        return car.generationId === id && state.favorites.includes(car.id)
      })
    },

    // Objets voiture des favoris (pas seulement les ID)
    getFavorites: (state) => {
      const favoriteCars = state.favorites.map(favoriteId => {
        return state.cars.find(car => car.id === favoriteId)
      })
      return favoriteCars.filter(car => car !== undefined)
    },
  },

  actions: {
    async fetchCars ({ withLoader = true } = {}) {
      if (withLoader) this.isLoading = true

      try {
        const response = await api.get('/variants', { params: { limit: 100 } })
        this.cars = response.data.data
        this.cleanupFavorites()
      } catch (error) {
        console.error('Erreur:', error.message)
        this.error = 'Erreur lors du chargement des voitures'
        this.cars = []
      } finally {
        if (withLoader) this.isLoading = false
      }
    },

    async init () {
      this.isLoading = true
      this.error = null
      this.loadFavorites() // AVANT le chargement des voitures
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
    loadFavorites () {
      try {
        const saved = localStorage.getItem('car_favorites')
        const parsed = saved ? JSON.parse(saved) : []
        this.favorites = Array.isArray(parsed) ? parsed : []
        console.log('Favoris chargés :', this.favorites.length, 'éléments')
      } catch (error) {
        console.error('Erreur lors du chargement des favoris :', error)
        this.favorites = []
      }
    },

    // Sauvegarde les favoris dans localStorage
    saveFavorites () {
      try {
        localStorage.setItem('car_favorites', JSON.stringify(this.favorites))
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des favoris :', error)
      }
    },

    // Ajoute ou retire une version des favoris
    toggleFavorite (car) {
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
