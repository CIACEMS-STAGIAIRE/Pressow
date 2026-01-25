/**
 * Utilitaire pour la gestion des URLs de médias
 * Gère la conversion des URLs Docker vers les URLs accessibles
 * selon l'environnement (développement / production)
 */

// URL de base du backend selon l'environnement
const BACKEND_DEV_URL = 'http://localhost:8000'
const BACKEND_PROD_URL = import.meta.env.VITE_BACKEND_URL || 'https://pressow.com'

/**
 * Convertit une URL de média en URL accessible selon l'environnement
 * 
 * @param url - L'URL du média (peut être relative ou absolue)
 * @returns L'URL accessible ou null si l'URL est invalide
 * 
 * @example
 * // En développement (localhost)
 * getImageUrl('/media/providers/logos/image.png') // => 'http://localhost:8000/media/providers/logos/image.png'
 * getImageUrl('http://backend:8000/media/image.png') // => 'http://localhost:8000/media/image.png'
 * 
 * // En production
 * getImageUrl('/media/providers/logos/image.png') // => 'https://pressow.com/media/providers/logos/image.png'
 */
export const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null

  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  const baseUrl = isDev ? BACKEND_DEV_URL : BACKEND_PROD_URL

  // En développement (localhost)
  if (isDev) {
    // Si l'URL commence par /media/, ajouter le domaine localhost
    if (url.startsWith('/media/')) {
      return `${BACKEND_DEV_URL}${url}`
    }
    
    // Si l'URL contient backend:8000 (Docker), le remplacer par localhost:8000
    if (url.includes('backend:8000')) {
      return url.replace('http://backend:8000', BACKEND_DEV_URL)
    }
    
    // Si l'URL contient host.docker.internal, le remplacer par localhost
    if (url.includes('host.docker.internal:8000')) {
      return url.replace('http://host.docker.internal:8000', BACKEND_DEV_URL)
    }
    
    // Si l'URL est complète et pointe vers production, la garder telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Extraire le chemin /media/... si présent
      const mediaIndex = url.indexOf('/media/')
      if (mediaIndex !== -1) {
        return `${BACKEND_DEV_URL}${url.substring(mediaIndex)}`
      }
      return url
    }
    
    return url
  }

  // En production
  if (url.startsWith('/media/')) {
    return `${baseUrl}${url}`
  }
  
  if (url.includes('backend:8000')) {
    return url.replace('http://backend:8000', baseUrl)
  }
  
  if (url.includes('host.docker.internal:8000')) {
    return url.replace('http://host.docker.internal:8000', baseUrl)
  }
  
  // Si c'est une URL avec une IP Docker interne, extraire le chemin media
  if (url.includes('/media/')) {
    const mediaIndex = url.indexOf('/media/')
    return `${baseUrl}${url.substring(mediaIndex)}`
  }
  
  return url
}

/**
 * Vérifie si une URL est valide pour être utilisée comme source d'image
 * 
 * @param url - L'URL à vérifier
 * @returns true si l'URL est valide
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/media/') || url.startsWith('data:image/')
}

export default getImageUrl
