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
      {pending ? "Memproses..." : "Konfirmasi & Simpan Data"}
    </button>
  );
}

export default function BookingModal({ isOpen, onClose, room }: any) {
  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    const result = await createBooking(formData);
    if (result.success) {
      alert("Pendaftaran penyewa offline berhasil disimpan!");
      onClose();
    } else {
      alert("Error: " + result.error);
    }
  }

  // 1. Ambil harga dari tabel relasi kelas
  const roomPrice = room.room_classes?.price || 0;
  const roomClassName = room.room_classes?.name || "Belum ada kelas";

  // 2. Generate ID Offline secara otomatis berdasarkan waktu saat ini
  const generatedOfflineId = `offline_${Date.now()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Input Penghuni Kamar {room.room_number}</h2>
            <p className="text-sm text-gray-500">Lantai {room.floor} • Kost Griya Citra</p>
            <p className="text-xs font-bold text-blue-600 mt-1">{roomClassName}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        {/* Tambahkan overflow-y-auto agar form bisa di-scroll jika layar HP kecil */}
        <form action={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Hidden Fields */}
          <input type="hidden" name="room_id" value={room.id} />
          <input type="hidden" name="room_number" value={room.room_number} />
          <input type="hidden" name="amount" value={roomPrice} />
          
          {/* ID otomatis disembunyikan dari Admin */}
          <input type="hidden" name="user_id" value={generatedOfflineId} />

          {/* Alert Info Offline */}
          <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg text-xs border border-yellow-200">
            <strong>Mode Offline:</strong> Penghuni ini tidak menggunakan aplikasi. Data tagihan akan langsung berstatus <b>Lunas</b> untuk bulan pertama.
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Penyewa</label>
            <input name="full_name" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan nama lengkap" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nomor WhatsApp</label>
            <input name="phone" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: 0812xxxx" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email (Opsional)</label>
            <input name="email" type="email" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Kosongkan jika tidak ada" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tanggal Masuk</label>
            <input name="start_date" type="date" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" defaultValue={new Date().toISOString().split('T')[0]} />
          </div>

          {/* INPUT BARU: UPLOAD BUKTI PEMBAYARAN */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Upload Bukti Transfer / Kwitansi</label>
            <input 
              name="payment_proof" 
              type="file" 
              accept="image/*"
              className="w-full p-2 border rounded-lg text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 mt-2">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Total Pembayaran:</span>
              <span className="font-bold text-blue-700">Rp {roomPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}