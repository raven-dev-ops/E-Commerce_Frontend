// app/cart/CartClient.tsx
'use client'

import { useSession } from 'next-auth/react'

export default function CartClient() {
  const { data: session } = useSession()

  return (
    <div>
      <h1>Your Cart</h1>
      {session ? (
        <p>Welcome, {session.user?.name}!</p>
      ) : (
        <p>Please log in to view your cart.</p>
      )}
    </div>
  )
}
