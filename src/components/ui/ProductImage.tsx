import Image from 'next/image'

interface ProductImageProps {
  src?: string | null
  alt: string
  className?: string
}

export function ProductImage({ src, alt, className }: ProductImageProps) {
  const fallbackUrl = `data:image/svg+xml,${encodeURIComponent(`
    <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#F1F3F5"/>
      <rect x="160" y="140" width="80" height="80" rx="8" fill="#DEE2E6"/>
      <path d="M180 180H220" stroke="#ADB5BD" stroke-width="4" stroke-linecap="round"/>
      <path d="M200 160V200" stroke="#ADB5BD" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `)}`

  return (
    <div className={className}>
      <Image
        src={src || fallbackUrl}
        alt={alt}
        width={400}
        height={400}
        className="object-cover w-full h-full rounded-xl"
      />
    </div>
  )
}
