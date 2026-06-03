"use client";

import { useEffect, useState } from "react";
import { getDashboardStats } from "@/app/actions/dashboardActions";

export default function DashboardStats() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then((res) => {
      if (res.success) setStats(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="w-full h-40 bg-gray-100 rounded-xl animate-pulse mb-8"></div>;
  }

  if (!stats) return null;

  return (
    <div className="mb-12 space-y-8">
      {/* KARTU STATISTIK ATAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kartu 1: Pendapatan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 
              2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Pendapatan Bulan Ini</p>
            <p className="text-2xl font-black text-gray-900">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Kartu 2: Okupansi Kamar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 
              7h1m-1 4h1m3-4h1m-1 4h1m-5 8h8"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Kamar Terisi</p>
            <p className="text-2xl font-black text-gray-900">
              {stats.occupiedRooms} <span className="text-sm font-medium text-gray-400">/ {stats.totalRooms} Kamar</span>
            </p>
          </div>
        </div>

        {/* Kartu 3: Tunggakan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-red-50 rounded-xl">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 
              4c-.77-1.333-2.694-1.333-3.464 
              0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500">Belum Lunas ({stats.unpaidCount} Tagihan)</p>
            <p className="text-2xl font-black text-red-600">Rp {stats.totalUnpaid.toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* TABEL RINCIAN TAGIHAN */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Status Tagihan Penyewa Bulan Ini</h3>
          <p className="text-sm text-gray-500">Daftar penyewa aktif yang wajib membayar tagihan.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Kamar</th>
                <th className="px-6 py-4">Nama Penyewa</th>
                <th className="px-6 py-4">Jatuh Tempo</th>
                <th className="px-6 py-4">Nominal</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Metode Pembayaran</th>
                <th className="px-6 py-4">Bukti Offline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.detailedList?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 italic">
                    Belum ada data tagihan yang diterbitkan bulan ini.
                  </td>
                </tr>
              ) : (
                // Mengurutkan agar yang "unpaid" berada di paling atas
                stats.detailedList?.sort((a: any, b: any) => (a.status === 'unpaid' ? -1 : 1)).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{inv.roomNumber}</td>
                    <td className="px-6 py-4 font-medium">{inv.userName}</td>
                    <td className="px-6 py-4">{new Date(inv.dueDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</td>
                    <td className="px-6 py-4 font-medium">Rp {inv.amount.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                        inv.status === 'paid' ? 'bg-green-100 text-green-700 border border-green-200' : 
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {inv.status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.paymentMethod ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md 
                        bg-gray-100 text-xs font-semibold text-gray-700 border border-gray-200">
                          {inv.paymentMethod}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {inv.proofUrl ? (
                        <a 
                          href={inv.proofUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Lihat Struk
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}