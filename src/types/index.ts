export interface Attraction {
  id: string
  name: string
  category: 'natural' | 'cultural' | 'urban' | 'island'
  latitude: number
  longitude: number
  shortDesc: string
  fullDesc: string
  images: string[]
  panorama?: string
  openTime: string
  ticketPrice: string
  bestSeason: string
  duration: string
  transport: string
  visa: string
  currency: string
  language: string
  tips: string[]
  food: string[]
  hotels: string[]
  routes: Route[]
}

export interface Route {
  name: string
  duration: string
  highlights: string[]
}

export interface Coordinate {
  lat: number
  lng: number
}
