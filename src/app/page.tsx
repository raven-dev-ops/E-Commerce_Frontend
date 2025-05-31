import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-[url('/background-image.jpg')] bg-cover bg-center">
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center min-h-screen text-white text-center">
        <h1 className="text-3xl">Under Construction</h1>
      </main>
    </div>
  );
}
