'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  id: string
  title: string
  description: string
  price: number
  category: string
  image: string
}

export function ProductCard({
  id,
  title,
  description,
  price,
  category,
  image,
}: ProductCardProps) {
  return (
    <article className="bg-white border rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Product Image */}
      <div className="relative h-[180px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
        {/* All listings are treated as fungible, so no uniqueness badge */}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1">
        <h2 className="font-display text-xl font-semibold mb-2 text-neutral-800 hover:text-primary">
          {title}
        </h2>
        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">
          {description}
        </p>
        <p className="text-xl font-bold text-primary mb-2">
          ${price.toFixed(2)}
        </p>
        <span className="inline-block text-xs bg-neutral-100 text-neutral-700 px-2 py-1 rounded border border-neutral-200">
          {category}
        </span>
      </div>

      {/* Card Footer */}
      <div className="p-4 border-t">
        <Link
          href={`/products/${id}`}
          className="block w-full bg-primary text-white text-center py-2 px-4 rounded font-medium hover:bg-primary/90 transition-colors"
        >
          View & Join Groups
        </Link>
      </div>
    </article>
  )
}
