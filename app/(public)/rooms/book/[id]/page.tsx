import { supabaseAdmin } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createBookingForTenant } from "@/app/actions/tenantActions";

export default async function ConfirmBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const { id } = await params;

  // 1. UPDATE KUERI SUPABASE: Ambil data kamar beserta kelasnya
  const { data: room, error } = await supabaseAdmin
    .from('rooms')
    .select('*, room_classes(name, price)') 
    .eq('id', id)
    .single();

  if (error || !room || room.status !== 'available') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold">Kamar tidak tersedia.</h1>
        <p className="text-gray-500">Status saat ini: {room?.status || 'Tidak ditemukan'}</p>
        <a href="/rooms" className="text-blue-600 underline mt-4 block">Kembali ke daftar kamar</a>
      </div>
    );
  }

  // 2. TENTUKAN HARGA DAN NAMA KELAS
  const roomPrice = room.room_classes?.price || 0;
  const roomClassName = room.room_classes?.name || "Belum ada kelas";

  // Dapatkan tanggal hari ini (WIB / UTC+7) untuk memblokir tanggal masa lalu
  const now = new Date();
  const todayWIB = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const minDate = todayWIB.toISOString().split('T')[0];

  // Variabel defaultName dari Clerk dihapus agar kolom benar-benar kosong dari awal

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border">
        <h1 className="text-2xl font-bold mb-6">Konfirmasi Pesanan</h1>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-2 border-b items-center">
            <span className="text-gray-500">Kamar</span>
            <div className="text-right">
              <span className="font-bold block">{room.room_number} (Lantai {room.floor})</span>
              <span className="text-xs text-blue-600 font-bold block mt-1">{roomClassName}</span>
            </div>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Harga per Bulan</span>
            <span className="font-bold text-blue-600">Rp {roomPrice.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <form action={createBookingForTenant} className="space-y-4">
          <input type="hidden" name="room_id" value={room.id} />
          <input type="hidden" name="user_id" value={user.id} />
          <input type="hidden" name="amount" value={roomPrice} />
          <input type="hidden" name="email" value={user.emailAddresses[0].emailAddress} />

          {/* INPUT: NAMA LENGKAP KOSONG & HANYA PLACEHOLDER */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap (Sesuai KTP)</label>
            <input
              type="text"
              name="full_name"
              required
              placeholder="Isi nama lengkap anda.."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Nama ini akan digunakan untuk data administrasi dan tagihan.</p>
          </div>

          {/* INPUT: TANGGAL MASUK */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Pilih Tanggal Masuk Kost</label>
            <input
              type="date"
              name="start_date"
              required
              min={minDate} 
              defaultValue={minDate} 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Masa sewa dan tagihan bulanan akan dihitung mulai dari tanggal ini.</p>
          </div>

          {/* INPUT: NOMOR WA */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nomor WhatsApp Aktif</label>
            <input
              type="text"
              name="phone_number"
              required
              placeholder="Contoh: 08*******"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Nota lunas dan tagihan akan dikirimkan ke nomor ini.</p>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 mt-6 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Konfirmasi & Lanjut Pembayaran
          </button>
        </form>
      </div>
    </div>
  );
}