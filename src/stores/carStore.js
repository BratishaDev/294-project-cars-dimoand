import { defineStore } from 'pinia'
import api from '@/plugins/axios'

export const useCarsStore = defineStore('cars', {
  state: () => ({
    cars: [],
    isLoading: false,
    error: null,
  }),

  getters: {
    totalCars: (state) => state.cars.length,

    // Liste des générations : un élément par generationId
    generations: (state) => {
      const groups = new Map()

      for (const car of state.cars) {
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
  },
})
