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
    return <div className="w-full h-24 bg-gray-100 rounded-xl animate-pulse mb-8"></div>;
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Kartu 1: Pendapatan */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
        <div className="p-4 bg-green-50 rounded-xl">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m3-4h1m-1 4h1m-5 8h8"></path>
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-gray-500">Belum Lunas ({stats.unpaidCount} Kamar)</p>
          <p className="text-2xl font-black text-red-600">Rp {stats.totalUnpaid.toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
}