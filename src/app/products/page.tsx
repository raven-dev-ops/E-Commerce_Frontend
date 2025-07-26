// app/products/page.tsx  (this is a SERVER component – no 'use client')
import ProductsClient from "./ProductsClient";

export const metadata = {
  title: "Products – TwiinZ Beard Balms",
};

export default function ProductsPage() {
  return <ProductsClient />;
}
