"use client";

import { useEffect, useState } from "react";
import { getAdminComplaints, updateComplaintStatus, deleteComplaint } from "@/app/actions/adminComplaintActions";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk memuat data keluhan
  const fetchComplaints = async () => {
    setLoading(true);
    const res = await getAdminComplaints();
    if (res.success) {
      setComplaints(res.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Fungsi saat admin mengubah status di dropdown
  const handleStatusChange = async (id: string, newStatus: string) => {
    // Ubah UI seketika agar terasa cepat (Optimistic UI Update)
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    
    // Kirim perubahan ke database
    await updateComplaintStatus(id, newStatus);
  };

  // Fungsi saat admin menghapus keluhan yang sudah selesai
  const handleDelete = async (id: string) => {
    const confirm = window.confirm("Apakah Anda yakin ingin menghapus data keluhan ini secara permanen?");
    if (!confirm) return;

    // Hapus dari UI sementara
    setComplaints(prev => prev.filter(c => c.id !== id));

    // Eksekusi penghapusan di database
    const res = await deleteComplaint(id);
    if (!res.success) {
      alert("Gagal menghapus keluhan. Silakan coba lagi.");
      fetchComplaints(); // Kembalikan data jika gagal
    }
  };

  // Desain Badge Warna untuk Status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Menunggu</span>;
      case 'diproses': return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Diproses</span>;
      case 'selesai': return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Selesai</span>;
      default: return null;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium animate-pulse">Memuat data keluhan...</div>;
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Manajemen Keluhan</h1>
        <p className="text-gray-500 mt-2">Daftar laporan perbaikan dan keluhan dari penyewa Kost Griya Citra.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-sm font-bold text-gray-600">Tanggal</th>
                <th className="p-4 text-sm font-bold text-gray-600">Kamar</th>
                <th className="p-4 text-sm font-bold text-gray-600">Detail Keluhan</th>
                <th className="p-4 text-sm font-bold text-gray-600">Status Saat Ini</th>
                <th className="p-4 text-sm font-bold text-gray-600 text-right">Aksi Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">Belum ada data keluhan.</td>
                </tr>
              ) : (
                complaints.map((keluhan) => (
                  <tr key={keluhan.id} className="hover:bg-gray-50 transition-colors">
                    {/* Tanggal */}
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(keluhan.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    
                    {/* Nomor Kamar */}
                    <td className="p-4">
                      <span className="text-lg font-black text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {keluhan.rooms?.room_number || '?'}
                      </span>
                    </td>
                    
                    {/* Detail Keluhan */}
                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-gray-900 text-sm mb-1">{keluhan.title}</p>
                      <p className="text-sm text-gray-500 line-clamp-2" title={keluhan.description}>
                        {keluhan.description}
                      </p>
                    </td>
                    
                    {/* Status Visual */}
                    <td className="p-4">
                      {getStatusBadge(keluhan.status)}
                    </td>
                    
                    {/* Aksi Ubah Status & Tombol Hapus */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={keluhan.status}
                          onChange={(e) => handleStatusChange(keluhan.id, e.target.value)}
                          className={`p-2 text-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer ${
                            keluhan.status === 'selesai' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-gray-300'
                          }`}
                        >
                          <option value="pending">Menunggu</option>
                          <option value="diproses">Diproses</option>
                          <option value="selesai">Selesai</option>
                        </select>

                        {/* Tombol Hapus: Hanya muncul jika statusnya 'selesai' */}
                        {keluhan.status === 'selesai' && (
                          <button
                            onClick={() => handleDelete(keluhan.id)}
                            title="Hapus riwayat keluhan"
                            className="p-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-200 hover:border-red-500 rounded-lg transition-all focus:outline-none"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 
                              01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
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