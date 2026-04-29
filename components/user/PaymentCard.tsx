"use client";

import { useState } from "react";
import { generateSnapToken } from "@/app/actions/paymentActions";

// Memberitahu TypeScript bahwa script Midtrans sudah ada di layout
declare global {
  interface Window {
    snap: any;
  }
}

export default function PaymentCard({ invoice }: any) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    
    // 1. Minta Token dari Server
    const res = await generateSnapToken(invoice.id);

    if (res.success && res.token) {
      // 2. Panggil Pop-up Midtrans
      window.snap.pay(res.token, {
        onSuccess: function (result: any) {
          alert("Pembayaran berhasil disimulasikan!");
          window.location.reload(); // Refresh halaman untuk memperbarui status
        },
        onPending: function (result: any) {
          alert("Pembayaran tertunda. Silakan selesaikan transfer Anda.");
          setLoading(false);
        },
        onError: function (result: any) {
          alert("Pembayaran gagal atau kadaluarsa.");
          setLoading(false);
        },
        onClose: function () {
          setLoading(false);
        }
      });
    } else {
      alert("Error memuat pembayaran: " + res.error);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border-2 border-red-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <p className="text-xs font-bold text-red-500 uppercase mb-1">Jatuh Tempo: {invoice.due_date}</p>
        <p className="text-2xl font-black text-gray-900">
          Rp {invoice.amount.toLocaleString('id-ID')}
        </p>
      </div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all disabled:bg-gray-400"
      >
        {loading ? 'Memuat...' : 'Bayar Sekarang'}
      </button>
    </div>
  );
}