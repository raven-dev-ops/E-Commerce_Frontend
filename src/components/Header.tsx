import Link from 'next/link';
import React from 'react';
import { useStore } from '@/store/useStore';
const Header: React.FC = () => {
  const { cart } = useStore();
 
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="container mx-auto flex justify-between">
        <Link href="/" className="mr-4">Home</Link>
        {/* Display cart item count */}
        <Link href="/cart">Cart ({totalItems})</Link>

      </nav>
    </header>
  );
};
export default Header;
