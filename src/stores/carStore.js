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
    sortBy: 'default',
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
      return Boolean(state.search) || Boolean(state.bodyType) || state.sortBy !== 'default'
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
      if (state.sortBy !== 'default') {
        const direction = state.sortBy === 'name-desc' ? -1 : 1
        list.sort((a, b) => direction * (a.displayName ?? '').localeCompare(b.displayName ?? ''))
      }

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
  },

  actions: {
    async fetchCars ({ withLoader = true } = {}) {
      if (withLoader) this.isLoading = true

      try {
        const response = await api.get('/variants', { params: { limit: 100 } })
        this.cars = response.data.data
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
      this.sortBy = 'default'
    },
  },
})
