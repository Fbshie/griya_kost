"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
// Pastikan path import ini sesuai dengan lokasi file action Anda
import { checkUserActiveBooking } from "@/app/actions/manageRoomActions"; 

export default function PublicRoomGrid({ rooms }: { rooms: any[] }) {
  // Ambil userId dari Clerk
  const { isSignedIn, userId } = useAuth(); 
  const router = useRouter();
  
  // State untuk mencegah klik ganda dan memberi feedback visual
  const [loadingId, setLoadingId] = useState<string | null>(null); 

  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort();

  // Ubah fungsi menjadi async
  const handleBooking = async (room: any) => {
    if (room.status !== 'available') return;

    if (!isSignedIn || !userId) {
      // Jika belum login, arahkan ke login dulu
      router.push("/sign-in");
      return;
    }

    // === MULAI KODE SATPAM PENCEGAH ===
    setLoadingId(room.id); // Tampilkan status loading di tombol kamar yang diklik

    try {
      // Cek ke database apakah user ini sudah punya kamar aktif
      const isAlreadyRenting = await checkUserActiveBooking(userId);

      if (isAlreadyRenting) {
        alert("Peringatan: Anda masih memiliki kamar yang berstatus Aktif!\n\nSatu akun hanya diperbolehkan menyewa satu kamar dalam satu waktu.");
        router.push("/dashboard"); // Arahkan ke dashboard penyewa
        return; // Hentikan eksekusi, jangan lanjut ke halaman konfirmasi!
      }

      // Jika aman, arahkan ke halaman konfirmasi booking
      router.push(`/rooms/book/${room.id}`);

    } catch (error) {
      console.error("Gagal memeriksa status penyewa:", error);
      alert("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoadingId(null); // Matikan status loading
    }
    // === AKHIR KODE SATPAM PENCEGAH ===
  };

  return (
    <div className="space-y-12">
      {floors.map((floor) => (
        <section key={floor}>
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-gray-800">Lantai {floor}</h3>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* === TAMBAHAN WADAH GAMBAR DENAH === */}
          <div className="mb-8 flex justify-center px-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={`/booking/lantai_${floor}.png`} 
              alt={`Denah Letak Kamar Lantai ${floor}`}
              className="w-full max-w-2xl rounded-2xl shadow-sm border border-gray-100 object-contain bg-white"
            />
          </div>
          {/* === AKHIR WADAH GAMBAR DENAH === */}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {rooms.filter(r => r.floor === floor).map((kamar) => {
              // AMBIL HARGA DAN NAMA KELAS DARI RELASI DATABASE
              const roomPrice = kamar.room_classes?.price || 0;
              const roomClassName = kamar.room_classes?.name || "Belum ada kelas";

              return (
                <div 
                  key={kamar.id}
                  onClick={() => handleBooking(kamar)}
                  // Tambahkan disable klik jika sedang loading
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer shadow-sm flex flex-col justify-between ${
                    kamar.status === 'available' 
                    ? (loadingId === kamar.id ? 'bg-gray-50 border-blue-300' : 
                      'bg-white border-transparent hover:border-blue-500 hover:shadow-lg') 
                    : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                  } ${loadingId ? 'pointer-events-none' : ''}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-2xl font-black text-gray-800">{kamar.room_number}</span>
                      {kamar.status === 'available' ? (
                        <span className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Terisi</span>
                      )}
                    </div>
                    {/* Tampilkan Nama Kelas */}
                    <p className="text-xs font-bold text-blue-600 mb-2">{roomClassName}</p>
                    <p className="text-sm text-gray-500">Harga per bulan:</p>
                  </div>
                  
                  <div>
                    {/* Tampilkan Harga yang sudah di-update */}
                    <p className="font-bold text-gray-900 mt-1">Rp {roomPrice.toLocaleString('id-ID')}</p>
                    
                    {kamar.status === 'available' && (
                      <button 
                        disabled={loadingId === kamar.id}
                        className="mt-4 w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 
                        hover:text-white transition-colors disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500"
                      >
                        {loadingId === kamar.id ? 'Mengecek...' : 'Pesan Sekarang'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  );
}