export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]" style={{
      backgroundImage: `url('/images/background-image.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      width: '100vw',  // Adjust width to full viewport width
      height: '100vh', // Adjust height to full viewport height
      overflow: 'hidden', // Hide any overflow to prevent scroll bars
    }}>
      <main className="flex flex-col gap-[32px] row-start-2 items-center justify-center min-h-screen w-full text-white text-center bg-transparent">
        <h1 className="text-3xl">Under Construction</h1>
      </main>
    </div>
  );
}
