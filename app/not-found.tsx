import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-black text-primary mb-4">404</p>
      <h1 className="text-2xl font-bold mb-2">Page not found</h1>
      <p className="text-ink/40 mb-8">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        href="/"
        className="bg-primary px-6 py-3 rounded-xl font-semibold text-white hover:-translate-y-0.5 transition-transform"
      >
        Back home
      </Link>
    </main>
  );
}
