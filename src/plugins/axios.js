import axios from 'axios'

// import.meta.env.VITE_API_URL → lit la variable VITE_API_URL depuis le fichier .env
// || 'https://apis.divtec.me/api/cars/variants?limit=100' → valeur par défaut si la variable n'existe pas
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apis.divtec.me/api/cars/variants?limit=100'

// axios.create() crée une instance Axios avec une configuration réutilisable
// baseURL → toutes les requêtes partiront de cette URL
// headers → en-têtes HTTP envoyés automatiquement avec chaque requête
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'fr',
  },
})

// On exporte l'instance pour l'utiliser partout : import api from '@/plugins/axios'
export default api
