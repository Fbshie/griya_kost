"use client";

import { createBooking } from "@/app/actions/bookingActions";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all disabled:bg-gray-400"
    >
      {pending ? "Memproses..." : "Konfirmasi Booking & Kirim WA"}
    </button>
  );
}

export default function BookingModal({ isOpen, onClose, room }: any) {
  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    const result = await createBooking(formData);
    if (result.success) {
      alert("Booking Berhasil! WhatsApp tagihan telah dikirim.");
      onClose();
    } else {
      alert("Error: " + result.error);
    }
  }

  // 1. Ambil harga dari tabel relasi kelas
  // Kita gunakan || 0 sebagai antisipasi jika kamar belum memiliki kelas
  const roomPrice = room.room_classes?.price || 0;
  const roomClassName = room.room_classes?.name || "Belum ada kelas";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Booking Kamar {room.room_number}</h2>
            <p className="text-sm text-gray-500">Lantai {room.floor} • Kost Griya Citra</p>
            {/* Tambahan: Menampilkan Nama Kelas */}
            <p className="text-xs font-bold text-blue-600 mt-1">{roomClassName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-4">
          {/* Hidden Fields untuk Server Action */}
          <input type="hidden" name="room_id" value={room.id} />
          <input type="hidden" name="room_number" value={room.room_number} />
          {/* 2. Update value amount dengan harga dari relasi kelas */}
          <input type="hidden" name="amount" value={roomPrice} />

          {/* ID sementara untuk penyewa */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">ID Clerk Penyewa</label>
            <input
              name="user_id"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-yellow-50"
              placeholder="Paste ID Clerk (user_...) di sini"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Penyewa</label>
            <input name="full_name" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan nama lengkap" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nomor WhatsApp</label>
            <input name="phone" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="62812xxxx (Fonnte format)" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
            <input name="email" type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="alamat@email.com" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Masuk</label>
            <input name="start_date" type="date" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Total Tagihan Pertama:</span>
              {/* 3. Update tampilan harga Rupiah */}
              <span className="font-bold text-blue-700">Rp {roomPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}