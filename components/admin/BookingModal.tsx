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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Booking Kamar {room.room_number}</h2>
            <p className="text-sm text-gray-500">Lantai {room.floor} • Kost Griya Citra</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-4">
          {/* Hidden Fields untuk Server Action */}
          <input type="hidden" name="room_id" value={room.id} />
          <input type="hidden" name="room_number" value={room.room_number} />
          <input type="hidden" name="amount" value={room.price_per_month} />

          
          {/* ID sementara untuk penyewa (misal manual_hp) */}
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
              <span className="font-bold text-blue-700">Rp {room.price_per_month.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}