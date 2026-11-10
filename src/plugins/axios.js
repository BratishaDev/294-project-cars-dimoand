import axios from 'axios'

// import.meta.env.VITE_API_URL → lit la variable VITE_API_URL depuis le fichier .env
// ou 'https://apis.divtec.me/api/cars' → valeur par défaut si la variable n'existe pas
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apis.divtec.me/api/cars'

// axios.create() crée une instance Axios avec une configuration réutilisable
// baseURL → toutes les requêtes partiront de cette URL
// headers → en-têtes HTTP envoyés automatiquement avec chaque requête
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept-Language': 'fr',
  },
  // Sans réponse après 10 s, Axios lève une erreur → le store affiche le message d'erreur
  // (sans timeout, les squelettes de chargement pourraient tourner indéfiniment)
  timeout: 10000,
})

// On exporte l'instance pour l'utiliser partout : import api from '@/plugins/axios'
export default api
