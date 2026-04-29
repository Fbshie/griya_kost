import { supabaseAdmin } from '@/lib/supabase';
import PublicRoomGrid from '@/components/rooms/PublicRoomGrid';

export const dynamic = 'force-dynamic';

export default async function PublicRoomsPage() {
  // Ambil semua data kamar dari database
  const { data: rooms, error } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .order('room_number', { ascending: true });

  if (error) return <div className="p-8">Gagal memuat data kamar.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Kost Griya Citra</h1>
          <p className="text-sm text-gray-500 font-medium">Pilih kamar idaman Anda</p>
        </div>
      </nav>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        <header className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Temukan Kamar Kost Terbaik</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Tersedia 45 kamar nyaman di lokasi strategis. Silakan pilih lantai dan nomor kamar yang tersedia untuk memulai reservasi.
          </p>
        </header>

        {/* Komponen Grid Kamar untuk Publik */}
        <PublicRoomGrid rooms={rooms} />
      </main>
    </div>
  );
}