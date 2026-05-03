"use client";

import { useEffect, useState } from "react";
import { getRoomDetails, markInvoiceAsPaid, checkoutRoom } from "@/app/actions/manageRoomActions";
import { markAsPaidManual } from '@/app/actions/adminActions';
import { sendPaymentReminder } from '@/app/actions/adminActions';

export default function OccupiedModal({ isOpen, onClose, room }: any) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reminderLoading, setReminderLoading] = useState(false);

  useEffect(() => {
    if (isOpen && room) {
      setLoading(true);
      getRoomDetails(room.id).then((res) => {
        if (res.success) setDetails(res.data);
        setLoading(false);
      });
    }
  }, [isOpen, room]);

  if (!isOpen) return null;

  // Mencari tagihan yang belum dibayar dari data invoice
  const unpaidInvoice = details?.invoices?.find((inv: any) => inv.status === 'unpaid');
  const paidInvoice = details?.invoices?.find((inv: any) => inv.status === 'paid');
  const tenant = details?.users;

  // const handlePayment = async () => {
  //   if (!unpaidInvoice) return;
  //   const confirm = window.confirm("Tandai tagihan ini sebagai LUNAS dan kirim nota via WA?");
  //   if (!confirm) return;

  //   setActionLoading(true);
  //   const res = await markInvoiceAsPaid(unpaidInvoice.id, tenant.phone_number, unpaidInvoice.amount, tenant.full_name);
  //   if (res.success) {
  //     alert("Pembayaran berhasil dicatat!");
  //     onClose();
  //   } else {
  //     alert("Error: " + res.error);
  //   }
  //   setActionLoading(false);
  // };

  const handleCheckout = async () => {
    const confirm = window.confirm("Yakin ingin melakukan checkout? Kamar ini akan dikosongkan.");
    if (!confirm) return;

    setActionLoading(true);
    const res = await checkoutRoom(room.id, details.id);
    if (res.success) {
      alert("Kamar berhasil dikosongkan!");
      onClose();
    } else {
      alert("Error: " + res.error);
    }
    setActionLoading(false);
  };

  const handleManualPayment = async (formData: FormData) => {
    setActionLoading(true);
    try {
      // Panggil server action dari dalam client
      await markAsPaidManual(formData);
      alert("Pembayaran manual berhasil & Lunas!");
      onClose(); // Langsung tutup modal agar admin bisa melihat status di luar
    } catch (error) {
      console.error(error);
      alert("Gagal memproses pembayaran. Cek file atau jaringan.");
    }
    setActionLoading(false);
  };

  const handleSendReminder = async () => {
    if (!unpaidInvoice) return;
    const confirm = window.confirm("Kirim pesan peringatan ke WA penyewa ini?");
    if (!confirm) return;

    setReminderLoading(true);
    try {
      await sendPaymentReminder(unpaidInvoice.id);
      alert("Pesan reminder berhasil dikirim!");
      // Tidak perlu onClose() agar admin masih bisa melihat detail kamar
    } catch (error) {
      alert("Gagal mengirim reminder.");
    }
    setReminderLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-blue-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Kamar {room.room_number} (Terisi)</h2>
            <p className="text-sm text-gray-500">Lantai {room.floor}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-gray-500 py-10 animate-pulse">Memuat data penghuni...</p>
          ) : !details ? (
            <p className="text-center text-red-500 py-10">Data tidak ditemukan.</p>
          ) : (
            <div className="space-y-6">
              {/* Info Penyewa */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Informasi Penyewa</p>
                <p className="font-bold text-gray-900 text-lg">{tenant?.full_name}</p>
                <p className="text-gray-600">{tenant?.phone_number}</p>
              </div>

              {/* Info Tagihan */}
              {unpaidInvoice ? (
                <div className="p-4 border-2 border-red-100 bg-red-50 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-sm font-bold text-red-600">Tagihan Belum Lunas</p>
                      <p className="text-xl font-black text-red-700">Rp {unpaidInvoice.amount.toLocaleString('id-ID')}</p>
                    </div>
                    <span className="bg-red-200 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase">Unpaid</span>
                  </div>

                  {/* TOMBOL PENGINGAT BARU */}
                  <button
                    type="button"
                    onClick={handleSendReminder}
                    disabled={reminderLoading}
                    className="w-full mb-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                  >
                    {reminderLoading ? 'Mengirim...' : 'Kirim Reminder WA (Penagihan)'}
                  </button>

                  {/* Form Pembayaran Manual */}
                  <form action={handleManualPayment} className="border-t border-red-200 pt-4 mt-2">
                    <input type="hidden" name="invoice_id" value={unpaidInvoice.id} />

                    <label className="block text-xs font-bold text-gray-600 mb-1">Upload Bukti Transfer / Kuitansi (Opsional)</label>
                    <input
                      type="file"
                      name="proof"
                      accept="image/*"
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 mb-3"
                    />

                    <button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      Konfirmasi Lunas Manual
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-xl border-2 border-green-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-green-600 uppercase mb-1">Status Keuangan</p>
                    <p className="font-bold text-green-800">Tagihan bulan ini LUNAS.</p>
                  </div>
                  {/* Menampilkan link bukti foto jika ada */}
                  {paidInvoice?.payment_proof && (
                    <a
                      href={paidInvoice.payment_proof}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm bg-white text-blue-600 px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 font-medium"
                    >
                      Lihat Bukti
                    </a>
                  )}
                </div>
              )}

              {/* Tombol Checkout */}
              <button
                onClick={handleCheckout}
                disabled={actionLoading}
                className="w-full mt-4 bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Proses...' : 'Checkout (Kosongkan Kamar)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}