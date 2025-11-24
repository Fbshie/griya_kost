import { currentUser } from '@clerk/nextjs/server' // Ganti import auth dengan currentUser
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  // 1. Ambil data user terbaru langsung dari server Clerk
  const user = await currentUser();

  // 2. Cek apakah user ada, dan apakah publicMetadata-nya admin
  // Perhatikan kita akses 'publicMetadata', bukan 'metadata'
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // 3. Logika Redirect
  if (!isAdmin) {
    return redirect('/'); // Tendang jika bukan admin
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold text-red-600">Halaman Khusus Admin</h1>
      <p>Selamat datang, {user?.firstName}. Anda memiliki akses penuh.</p>
    </div>
  )
}