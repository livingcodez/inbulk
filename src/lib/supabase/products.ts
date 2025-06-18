import { type ProductStatus } from '@/types/database.types'
import supabaseClient from './supabaseClient'

export async function getLiveProducts() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*, user_profiles(full_name)')
    .eq('status', 'live')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getProductById(id: string) {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*, user_profiles(full_name)')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getVendorProducts(vendorId: string) {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProduct(product: {
  name: string
  description: string | null
  price: number
  image_url: string | null
  vendor_id: string
  category: string
  subcategory: string | null
  min_buyers: number | null
  max_buyers: number | null
  actual_cost: number | null
  is_fungible: boolean
  delivery_time: string | null
}) {
  const { data, error } = await supabaseClient
    .from('products')
    .insert({
      ...product,
      status: 'draft' as ProductStatus,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: {
  name?: string
  description?: string | null
  price?: number
  image_url?: string | null
  category?: string
  subcategory?: string | null
  min_buyers?: number | null
  max_buyers?: number | null
  actual_cost?: number | null
  is_fungible?: boolean
  delivery_time?: string | null
  status?: ProductStatus
}) {
  const { data, error } = await supabaseClient
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  const { error } = await supabaseClient
    .from('products')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}
