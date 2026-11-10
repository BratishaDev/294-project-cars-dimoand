/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Composables
import { createVuetify } from 'vuetify'

// Thème « salon des années 60 » : cuir sombre, laiton et bordeaux
export default createVuetify({
  theme: {
    // 'system' : suit automatiquement le thème clair ou sombre de l'appareil de l'utilisateur
    defaultTheme: 'system',
    themes: {
      light: {
        dark: false,
        colors: {
          background: '#F1EADB',
          surface: '#FAF5EA',
          'surface-variant': '#E4D9C3',
          'on-surface-variant': '#4A3F33',
          'on-background': '#2B241D',
          'on-surface': '#2B241D',
          primary: '#7A2E3A',
          'on-primary': '#FAF5EA',
          secondary: '#2F5D4E',
          'on-secondary': '#FAF5EA',
        },
      },
      dark: {
        dark: true,
        colors: {
          background: '#1B1714',
          surface: '#262019',
          'surface-variant': '#3A3128',
          'on-surface-variant': '#D8CBB6',
          'on-background': '#EDE4D3',
          'on-surface': '#EDE4D3',
          primary: '#C9A66B',
          'on-primary': '#1B1714',
          secondary: '#A8505B',
          'on-secondary': '#F3EBDD',
        },
      },
    },
  },
})
