'use client'

import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'

export default function CartClient() {
  const router = useRouter()
  const { isAuthenticated, user, authHydrated } = useStore()

  const userName = user?.email || user?.username || 'User'

  const redirectToLogin = () => {
    router.push('/auth/login')
  }

  return (
    <div>
      <h1>Your Cart</h1>
      {!authHydrated ? (
        <p>Loading...</p>
      ) : isAuthenticated ? (
        <p>Welcome, {userName}!</p>
      ) : (
        <>
          <p>Please log in to view your cart.</p>
          <button
            onClick={redirectToLogin}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Go to Login
          </button>
        </>
      )}
    </div>
  )
}
