"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitComplaint } from "@/app/actions/complaintActions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LaporKeluhanPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pesan, setPesan] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Mencegah render sebelum Clerk selesai memuat status login
  if (!isLoaded) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Memuat...</div>;
  
  // Jika belum login, tendang ke halaman sign-in
  if (!isSignedIn) {
    router.push("/sign-in");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setPesan(null);

    const formData = new FormData(e.currentTarget);
    const respon = await submitComplaint(formData);

    if (respon.success) {
      setPesan({ type: "success", text: respon.message });
      (e.target as HTMLFormElement).reset(); // Kosongkan form setelah berhasil
    } else {
      setPesan({ type: "error", text: respon.message });
    }
    setLoading(false);
  };

  return (
    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        
        {/* Tombol Kembali */}
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Kembali ke Beranda
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-2">Laporkan Keluhan</h1>
        <p className="text-gray-500 text-sm mb-8">
          Fasilitas kamar Anda bermasalah? Laporkan di sini, pengurus kos akan segera menanganinya.
        </p>

        {/* Notifikasi Sukses/Error */}
        {pesan && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium flex items-start gap-3 ${pesan.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {pesan.type === "success" 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              }
            </svg>
            {pesan.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Pilihan Kategori / Judul */}
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">Kategori Masalah</label>
            <select 
              name="title" 
              id="title" 
              required
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="">-- Pilih Kategori --</option>
              <option value="AC / Pendingin Ruangan Mati">AC / Pendingin Ruangan Mati</option>
              <option value="Air PDAM Mati / Bocor">Air PDAM Mati / Bocor</option>
              <option value="Listrik / Lampu Bermasalah">Listrik / Lampu Bermasalah</option>
              <option value="Kerusakan Furnitur (Kasur/Lemari)">Kerusakan Furnitur (Kasur/Lemari)</option>
              <option value="Masalah Kebersihan / Keamanan">Masalah Kebersihan / Keamanan</option>
              <option value="Lainnya">Lainnya...</option>
            </select>
          </div>

          {/* Deskripsi Detail */}
          <div>
            <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">Detail Keluhan</label>
            <textarea 
              name="description" 
              id="description" 
              rows={4} 
              required
              placeholder="Ceritakan detail kerusakannya di sini. Contoh: AC di kamar saya meneteskan air sejak semalam..."
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Mengirim...
              </>
            ) : "Kirim Keluhan"}
          </button>
        </form>

      </div>
    </div>
    <Footer />
    </>
  );
}