import { supabaseAdmin } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import RoomGrid from '@/components/admin/RoomGrid';
import DashboardStats from '@/components/admin/DashboardStats';

type Kamar = {
  id: string;
  room_number: string;
  floor: number;
  price_per_month: number;
  status: 'available' | 'occupied' | 'maintenance';
};

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await currentUser();

  // Proteksi Halaman Admin
  const isAdmin = user?.publicMetadata?.role === 'admin';
  if (!isAdmin) {
    return redirect('/');
  }

  // Ambil data 45 kamar dari tabel 'rooms'
  const { data: rawData, error } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .order('room_number', { ascending: true });

  if (error) {
    return (
      <div className="p-8 text-red-500">
        Gagal memuat data database: {error.message}
      </div>
    );
  }
  const rooms = rawData as Kamar[];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manajemen Kamar</h1>
        <p className="text-gray-500">Total {rooms.length} Kamar di Kost Griya Citra</p>
        <p className="text-gray-500">Klik pada kamar kosong untuk mendaftarkan penyewa baru.</p>
      </header>

      {/* --- STATISTIK --- */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center md:text-left">
          <p className="text-xs text-gray-500 uppercase font-bold">Kosong</p>
          <p className="text-2xl font-bold text-green-600">
            {rooms.filter(r => r.status === 'available').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center md:text-left">
          <p className="text-xs text-gray-500 uppercase font-bold">Terisi</p>
          <p className="text-2xl font-bold text-blue-600">
            {rooms.filter(r => r.status === 'occupied').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm text-center md:text-left">
          <p className="text-xs text-gray-500 uppercase font-bold">Perbaikan</p>
          <p className="text-2xl font-bold text-yellow-600">
            {rooms.filter(r => r.status === 'maintenance').length}
          </p>
        </div>
      </div>

      <DashboardStats/>

      {/* --- KOMPONEN ROOM GRID --- */}
      {rooms.length > 0 ? (
        <RoomGrid rooms={rooms} />
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
          <p className="text-gray-500">Belum ada data kamar di database.</p>
        </div>
      )}
      
    </div>
  );
}