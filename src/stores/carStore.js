import axios from 'axios'
import { defineStore } from 'pinia'

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
      return state.cars.filter(car => String(car.generationId) === String(generationId))
    },

    // Une version spécifique par ID
    getCarById: (state) => (carId) => {
      return state.cars.find(car => String(car.id) === String(carId))
    },
  },

  actions: {
    async fetchCars() {
      const response = await axios.get('https://apis.divtec.me/api/cars/variants?limit=100')
      this.cars = response.data.data
    },

    async init() {
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
