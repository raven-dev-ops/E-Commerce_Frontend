// src/app/products/[productId]/page.tsx

import { notFound } from 'next/navigation'
import ProductDetailsClient from '@/components/ProductDetailsClient'
import type { Product } from '@/types/product'

async function getProduct(productId: string): Promise<Product | null> {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')
  if (raw.startsWith('http://')) raw = raw.replace(/^http:\/\//, 'https://')
  const res = await fetch(`${raw}/products/${productId}/`, { cache: 'no-store' })

  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to fetch product: HTTP ${res.status}`)

  const data = await res.json()

  return {
    ...data,
    price: Number(data.price),
  } as Product
}

export default async function ProductDetailPage(props: any) {
  const {
    params: { productId },
  } = props

  const product = await getProduct(productId)
  if (!product) notFound()

  return <ProductDetailsClient product={product} />
}
