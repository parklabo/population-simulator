import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page not found</p>
        <Link 
          href="/"
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}