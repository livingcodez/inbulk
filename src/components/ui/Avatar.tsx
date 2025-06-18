import Image from 'next/image'
import { useMemo } from 'react'

interface AvatarProps {
  src?: string | null
  alt: string
  size?: number
  className?: string
}

export function Avatar({ src, alt, size = 40, className }: AvatarProps) {
  const fallbackUrl = useMemo(() => {
    // Generate initial-based avatar if no src
    const initials = alt
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    const colors = [
      'FF6B47', // primary
      '7DDFBD', // secondary
      'F2E6FF', // accent purple
      'E6F4FF', // accent blue
    ]
    
    const colorIndex = (initials.charCodeAt(0) || 0) % colors.length
    const bgColor = colors[colorIndex]
    
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#${bgColor}"/>
        <text 
          x="50%" 
          y="50%" 
          text-anchor="middle" 
          dy="0.35em"
          fill="#000000"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${size * 0.4}px"
          font-weight="500"
        >
          ${initials}
        </text>
      </svg>
    `)}`
  }, [alt, size])

  return (
    <div 
      className={className}
      style={{ 
        width: size,
        height: size,
        position: 'relative',
        borderRadius: '50%',
        overflow: 'hidden'
      }}
    >
      <Image
        src={src || fallbackUrl}
        alt={alt}
        fill
        className="object-cover"
        sizes={`${size}px`}
      />
    </div>
  )
}
