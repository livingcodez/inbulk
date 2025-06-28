'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Callback() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const ref = params.get('reference')
    if (!ref) {
      router.replace('/wallet?error=true')
      return
    }
    fetch(`/api/verify?reference=${ref}`)
      .then((res) => {
        if (res.ok) router.replace('/wallet?success=true')
        else router.replace('/wallet?error=true')
      })
      .catch(() => router.replace('/wallet?error=true'))
  }, [params, router])

  return <p className="p-4">Verifying payment...</p>
}
