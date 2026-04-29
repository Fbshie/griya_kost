"use client";

import { useEffect, useState } from "react";
import { getRoomDetails, markInvoiceAsPaid, checkoutRoom } from "@/app/actions/manageRoomActions";

export default function OccupiedModal({ isOpen, onClose, room }: any) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
  const tenant = details?.users;

  const handlePayment = async () => {
    if (!unpaidInvoice) return;
    const confirm = window.confirm("Tandai tagihan ini sebagai LUNAS dan kirim nota via WA?");
    if (!confirm) return;

    setActionLoading(true);
    const res = await markInvoiceAsPaid(unpaidInvoice.id, tenant.phone_number, unpaidInvoice.amount, tenant.full_name);
    if (res.success) {
      alert("Pembayaran berhasil dicatat!");
      onClose();
    } else {
      alert("Error: " + res.error);
    }
    setActionLoading(false);
  };

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
                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-red-500 uppercase">Tagihan Belum Lunas</p>
                    <p className="font-bold text-red-700 text-xl">Rp {unpaidInvoice.amount.toLocaleString('id-ID')}</p>
                  </div>
                  <button 
                    onClick={handlePayment} 
                    disabled={actionLoading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:bg-gray-400"
                  >
                    {actionLoading ? 'Proses...' : 'Bayar'}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <p className="text-xs font-bold text-green-600 uppercase mb-1">Status Keuangan</p>
                  <p className="font-bold text-green-800">Semua tagihan sudah lunas.</p>
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