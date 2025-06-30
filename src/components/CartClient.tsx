/// app/cart/CartClient.tsx

'use client'

import { useState, useEffect } from 'react';

export default function CartClient() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null); // Optional: if you want to display user's name

  useEffect(() => {
    // Check for the token in localStorage on the client side
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
      setUserName('User'); // Replace with actual user name if you fetch it
    } else {
      setIsLoggedIn(false);
      setUserName(null);
    }
  }, []); // Run this effect only once on component mount

  return (
    <div>
      <h1>Your Cart</h1>
      {isLoggedIn ? (<p>Welcome, {userName || 'User'}!</p>) : (<p>Please log in to view your cart.</p>)}
    </div>
  )
}
