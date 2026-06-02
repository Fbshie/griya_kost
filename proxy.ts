import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Tentukan halaman mana saja yang WAJIB LOGIN
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',   // Melindungi semua rute di dalam dashboard penyewa
  '/admin-panel(.*)', // Melindungi seluruh fitur dashboard admin
  '/rooms/book(.*)'   // Melindungi halaman konfirmasi pesanan kamar
]);

export default clerkMiddleware(async (auth, req) => {
  // Jika pengunjung mencoba mengakses halaman yang dilindungi, paksa mereka login
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Jangan ubah baris matcher ini, ini adalah standar dari Next.js dan Clerk
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};