import { supabaseAdmin } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createBookingForTenant } from "@/app/actions/tenantActions";

// Perhatikan penambahan async pada Props
export default async function ConfirmBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  // AWAL PERBAIKAN: Await params untuk Next.js 15
  const { id } = await params;

  // Ambil data kamar
  const { data: room, error } = await supabaseAdmin
    .from('rooms')
    .select('*')
    .eq('id', id)
    .single();

  // DEBUG: Jika masih error, coba uncomment baris di bawah ini untuk melihat isi data
  // console.log("Data Kamar ditemukan:", room);

  if (error || !room || room.status !== 'available') {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold">Kamar tidak tersedia.</h1>
        <p className="text-gray-500">Status saat ini: {room?.status || 'Tidak ditemukan'}</p>
        <a href="/rooms" className="text-blue-600 underline mt-4 block">Kembali ke daftar kamar</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border">
        <h1 className="text-2xl font-bold mb-6">Konfirmasi Pesanan</h1>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Kamar</span>
            <span className="font-bold">{room.room_number} (Lantai {room.floor})</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Nama Penyewa</span>
            <span className="font-bold">{user.firstName} {user.lastName}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Harga per Bulan</span>
            <span className="font-bold text-blue-600">Rp {room.price_per_month.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <form action={createBookingForTenant}>
          <input type="hidden" name="room_id" value={room.id} />
          <input type="hidden" name="user_id" value={user.id} />
          <input type="hidden" name="amount" value={room.price_per_month} />
          <input type="hidden" name="full_name" value={`${user.firstName} ${user.lastName}`} />
          <input type="hidden" name="email" value={user.emailAddresses[0].emailAddress} />

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nomor WhatsApp Aktif</label>
            <input
              type="text"
              name="phone_number"
              required
              placeholder="Contoh: 081234567890"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Nota lunas akan dikirimkan ke nomor ini.</p>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
            Konfirmasi & Lanjut Pembayaran
          </button>
        </form>
      </div>
    </div>
  );
}