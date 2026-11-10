import api from '@/plugins/axios'

// Fonctions d'accès à l'API : elles ne font QUE les requêtes HTTP.
// La logique (état, erreurs, favoris…) reste dans le store Pinia (stores/carStore.js).

// Récupère toutes les versions (variants) de voitures.
// limit: 100 → on demande tout le catalogue d'un coup (l'API contient 50 versions)
export async function fetchVariants () {
  const response = await api.get('/variants', { params: { limit: 100 } })
  // Deux « data » : le 1er est le corps de la réponse Axios,
  // le 2e est le tableau de voitures (l'API répond { data: [...], pagination: {...} })
  return response.data.data
}
