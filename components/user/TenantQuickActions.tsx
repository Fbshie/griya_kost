'use client'

import { useState } from 'react'
import Link from 'next/link'
import { requestCheckoutNotification } from '@/app/actions/tenantActions'

type QuickActionProps = {
  tenantName: string | null;
  roomNumber: string;
}

export default function TenantQuickActions({ tenantName, roomNumber }: QuickActionProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    const confirm = window.confirm("Apakah Anda yakin ingin mengajukan permohonan keluar (Checkout) dari kamar ini?\n\nAdmin akan menghubungi WA Anda untuk proses serah terima kunci.");
    if (!confirm) return;

    setLoading(true);
    const res = await requestCheckoutNotification(tenantName || "Penyewa", roomNumber);
    
    if (res.success) {
      alert("✅ Permohonan berhasil dikirim ke Admin. Silakan tunggu pesan WhatsApp dari kami.");
    } else {
      alert("❌ Gagal mengirim permohonan: " + res.error);
    }
    setLoading(false);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {/* Tombol Lapor Kerusakan */}
      <Link href="/complaint" className="bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md hover:border-red-200 transition-all flex items-center gap-4 group">
        <div className="bg-red-50 p-4 rounded-xl group-hover:bg-red-100 transition-colors">
          <span className="text-2xl">🛠️</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">Lapor Kerusakan</h3>
          <p className="text-sm text-gray-500 mt-0.5">Ada fasilitas yang rusak?</p>
        </div>
      </Link>

      {/* Tombol Ajukan Keluar */}
      <button 
        onClick={handleCheckout} 
        disabled={loading} 
        className="text-left bg-white p-5 rounded-2xl border shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex items-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="bg-orange-50 p-4 rounded-xl group-hover:bg-orange-100 transition-colors">
          <span className="text-2xl">📦</span>
        </div>
        <div>
          <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
            {loading ? 'Memproses Info...' : 'Ajukan Keluar Kamar'}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">Berhenti sewa / pindah kost.</p>
        </div>
      </button>
    </div>
  )
}