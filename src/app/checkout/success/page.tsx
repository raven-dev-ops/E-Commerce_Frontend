import Link from 'next/link';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams?: { orderId?: string };
}) {
  const orderId = searchParams?.orderId;

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-3">Payment successful</h1>
      <p className="text-gray-700 mb-6">
        Thanks for your order. You can track its status from your orders page.
      </p>
      {orderId && (
        <p className="text-sm text-gray-600 mb-6">
          Order ID: <span className="font-semibold">{orderId}</span>
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={orderId ? `/orders/${orderId}` : '/orders'}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          View Order
        </Link>
        <Link href="/products" className="px-4 py-2 border rounded">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
