import { useEffect, useState } from 'react'
import { type Product } from '@/types/database.types'
import * as productApi from '@/lib/supabase/products'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await productApi.getLiveProducts()
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load products'))
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return { products, loading, error }
}

export function useVendorProducts(vendorId: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await productApi.getVendorProducts(vendorId)
        setProducts(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load products'))
      } finally {
        setLoading(false)
      }
    }

    if (vendorId) {
      loadProducts()
    }
  }, [vendorId])

  return { products, loading, error }
}

export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadProduct() {
      if (!productId) return
      
      try {
        const data = await productApi.getProductById(productId)
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load product'))
      } finally {
        setLoading(false)
      }
    }

    loadProduct()
  }, [productId])

  return { product, loading, error }
}
