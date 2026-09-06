import { createServiceSupabase } from './server-supabase'

export type PublishPropertyInput = {
  hood: string
  area: string
  houseType: 'Bedsitter'|'1 Bedroom'|'2 Bedrooms'|'3 Bedrooms'
  rent: number
  deposit?: number
  vacancyDate: string
  water?: string
  security?: string
  road?: string
  internet?: string
  parking?: string
  petsAllowed?: boolean
}

export async function createPropertyForUser(userId: string, input: PublishPropertyInput) {
  const supabase = createServiceSupabase()
  const { data, error } = await supabase.from('properties').insert({
    owner_id: userId,
    hood: input.hood,
    area: input.area,
    house_type: input.houseType,
    rent: input.rent,
    deposit: input.deposit ?? input.rent,
    vacancy_date: input.vacancyDate,
    water: input.water,
    security: input.security,
    road: input.road,
    internet: input.internet,
    parking: input.parking,
    pets_allowed: input.petsAllowed ?? false,
    status: 'draft'
  }).select().single()
  if (error) throw error
  return data
}
